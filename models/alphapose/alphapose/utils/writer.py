from threading import Thread
from queue import Queue

import cv2
import numpy as np
import torch
import torch.multiprocessing as mp

from alphapose.utils.transforms import get_func_heatmap_to_coord
from alphapose.utils.pPose_nms import pose_nms, write_json
from alphapose.utils.vis import vis_frame

DEFAULT_VIDEO_SAVE_OPT = {
    "savepath": "examples/res/1.mp4",
    "fourcc": cv2.VideoWriter_fourcc(*"mp4v"),
    "fps": 30,
    "frameSize": (640, 480),
}

EVAL_JOINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]


class DataWriter:
    def __init__(
        self,
        cfg,
        opt,
        save_video=False,
        video_save_opt=DEFAULT_VIDEO_SAVE_OPT,
        queueSize=1024,
    ):
        self.cfg = cfg
        self.opt = opt
        self.video_save_opt = video_save_opt

        self.eval_joints = EVAL_JOINTS
        self.save_video = save_video
        self.heatmap_to_coord = get_func_heatmap_to_coord(cfg)
        # initialize the queue used to store frames read from
        # the video file
        if opt.sp:
            self.result_queue = Queue(maxsize=queueSize)
        else:
            self.result_queue = mp.Queue(maxsize=queueSize)

    def start_worker(self, target):
        if self.opt.sp:
            p = Thread(target=target, args=())
        else:
            p = mp.Process(target=target, args=())
        p.start()
        return p

    def start(self):
        # start a thread to read pose estimation results per frame
        self.result_worker = self.start_worker(self.update)
        return self

    def update(self):
        final_result = []
        norm_type = self.cfg.LOSS.get("NORM_TYPE", None)
        hm_size = self.cfg.DATA_PRESET.HEATMAP_SIZE
        if self.save_video:
            # initialize the file video stream, adapt ouput video resolution to original video
            stream = cv2.VideoWriter(
                *[
                    self.video_save_opt[k]
                    for k in ["savepath", "fourcc", "fps", "frameSize"]
                ]
            )
            assert stream.isOpened(), "Cannot open video for writing"

        # keep looping infinitelyd
        while True:
            # ensure the queue is not empty and get item
            (
                boxes,
                scores,
                ids,
                hm_data,
                cropped_boxes,
                orig_img,
                im_name,
            ) = self.wait_and_get(self.result_queue)
            if orig_img is None:
                # if the thread indicator variable is set (img is None),
                # stop the thread
                if self.save_video:
                    stream.release()

                write_json(final_result, self.opt.outputpath)
                print("Results have been written to json.")
                return

            # image channel RGB->BGR
            orig_img = np.array(orig_img, dtype=np.uint8)[:, :, ::-1]

            if boxes is None or len(boxes) == 0:
                if self.opt.vis or self.save_video:
                    self.write_image(
                        orig_img, stream=stream if self.save_video else None
                    )
            else:
                # location prediction (n, kp, 2) | score prediction (n, kp, 1)
                assert hm_data.dim() == 4
                # pred = hm_data.cpu().data.numpy()

                pose_coords = []
                pose_scores = []
                for i in range(hm_data.shape[0]):
                    bbox = cropped_boxes[i].tolist()
                    pose_coord, pose_score = self.heatmap_to_coord(
                        hm_data[i][self.eval_joints],
                        bbox,
                        hm_shape=hm_size,
                        norm_type=norm_type,
                    )
                    pose_coords.append(torch.from_numpy(pose_coord).unsqueeze(0))
                    pose_scores.append(torch.from_numpy(pose_score).unsqueeze(0))

                preds_img = torch.cat(pose_coords)
                preds_scores = torch.cat(pose_scores)
                boxes, scores, ids, preds_img, preds_scores, pick_ids = pose_nms(
                    boxes,
                    scores,
                    ids,
                    preds_img,
                    preds_scores,
                    self.opt.min_box_area,
                )

                _result = []
                for k in range(len(scores)):
                    _result.append(
                        {
                            "keypoints": preds_img[k],
                            "kp_score": preds_scores[k],
                            "proposal_score": torch.mean(preds_scores[k])
                            + scores[k]
                            + 1.25 * max(preds_scores[k]),
                            "idx": ids[k],
                            "box": [
                                boxes[k][0],
                                boxes[k][1],
                                boxes[k][2] - boxes[k][0],
                                boxes[k][3] - boxes[k][1],
                            ],
                        }
                    )

                result = {"imgname": im_name, "result": _result}

                final_result.append(result)
                if self.opt.vis or self.save_video:
                    img = vis_frame(orig_img, result, self.opt)
                    self.write_image(img, stream=stream if self.save_video else None)

    def write_image(self, img, stream=None):
        cv2.imshow("AlphaPose Demo", img)
        cv2.waitKey(1)

        if self.save_video:
            stream.write(img)

    def wait_and_put(self, queue, item):
        queue.put(item)

    def wait_and_get(self, queue):
        return queue.get()

    def save(self, boxes, scores, ids, hm_data, cropped_boxes, orig_img, im_name):
        # save next frame in the queue
        self.wait_and_put(
            self.result_queue,
            (boxes, scores, ids, hm_data, cropped_boxes, orig_img, im_name),
        )

    def running(self):
        # indicate that the thread is still running
        return not self.result_queue.empty()

    def count(self):
        # indicate the remaining images
        return self.result_queue.qsize()

    def stop(self):
        # indicate that the thread should be stopped
        self.save(None, None, None, None, None, None, None)
        self.result_worker.join()

    def terminate(self):
        # directly terminate
        self.result_worker.terminate()

    def clear_queues(self):
        self.clear(self.result_queue)

    def clear(self, queue):
        while not queue.empty():
            queue.get()

    def results(self):
        # return final result
        print(self.final_result)
        return self.final_result

    def recognize_video_ext(self, ext=""):
        return cv2.VideoWriter_fourcc(*"mp4v"), "." + ext
