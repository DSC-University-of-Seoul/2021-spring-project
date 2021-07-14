import cv2
from imutils.video import FileVideoStream
from kidskeeper.action_enum import ActionEnum
from utils.files import check_file
from utils.logger import Logger
from pathlib import Path

logger = Logger()


class PlayVideoException(cv2.error):
    # FIXME : THIS IS TEMP CODE !
    # Will be moved to exc.py file
    def __init__(self) -> None:
        super().__init__()


def get_video_metainfo(config, meta):
    """
    Get meta infomation about video file
    """
    # Metadata configuration
    nframe = meta.header.frames
    size = (meta.size.width, meta.size.height)

    # If resize option is true in config, video frame size is followed that option
    if config["resize"]:
        size = (int(config["width"]), int(config["height"]))

    return nframe, size


def display_frame(config, frame, n, action_frame_list, stop_command="q"):
    """
    Display the video frame
    """
    assert frame is not None
    if config["display"] is False:
        return

    # ADD TEXT
    font_face = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.5
    color = (0, 0, 0)
    for i, person in enumerate(action_frame_list):
        text = f"Person {i} : {ActionEnum(person[n]).name}"
        cv2.putText(frame, text, (10, 20 + 20 * i), font_face, scale, color, 2)

    cv2.imshow("Frame", frame)
    if cv2.waitKey(1) & 0xFF == ord(stop_command):
        raise PlayVideoException


def get_object_actions(meta, obj):
    nframes = meta.header.frames
    action_frames = [1] * nframes

    for act in obj.actions:
        act_value = ActionEnum[act.actionname.upper()].value
        for (start, end) in act.frames:
            start = max(0, start - 150)
            end = min(end + 150, nframes)
            for f in range(start, end):
                action_frames[f] = act_value

    return action_frames


def extract_video(config, file, meta):
    """
    Extract frame data list from mp4 file
    """

    # filename without only last extension
    basename = Path(file).stem

    # Metadata configuration
    nframe, size = get_video_metainfo(config, meta)
    logger.log(f"[{basename}] nframe: {nframe}, frame size: {size}")

    action_frame_list = list()
    for obj in meta.objects:
        action_frames = get_object_actions(meta, obj)
        action_frame_list.append(action_frames)
        print(len(action_frame_list))

    # Check the video file is actually exist
    input_video = FileVideoStream(check_file(file))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    output_video = cv2.VideoWriter(f"{basename}.mp4", fourcc, 30.0, size)

    output_frames = list()

    try:
        # Creating a frame data list from video information

        # Run the video
        video_stream = input_video.start()
        while video_stream.more():
            frame = video_stream.read()

            if not video_stream.more():
                break

            frame = cv2.resize(frame, size)
            # display_frame(config, frame, 2, action_frame_list)

            output_video.write(frame)
            output_frames.append(frame)

        logger.log(f"Total frame number of [{basename}] is {len(output_frames)} frames")

    except PlayVideoException:
        # When video is closed by user, this process will be closed
        logger.log("Video is Stopped")
        return

    finally:
        # Safely end video playback
        output_video.release()
        input_video.stop()
        cv2.destroyAllWindows()

    input("wait")
