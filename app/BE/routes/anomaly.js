import express from "express";
import { Sequelize } from "sequelize";
import ChildCareCenter from "../database/models/child-care-center";
import FacilityArea from "../database/models/facility-area";
import CCTV from "../database/models/cctv";
import Video from "../database/models/video";
import Anomaly from "../database/models/anomaly";

const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const { center_id, center_name } = req.query;
      let filters = {};
      if (center_id) {
        filters.center_id = center_id;
      }
      if (center_name) {
        filters.center_name = center_name;
      }
      const anomalies = await Anomaly.findAll({
        include: {
          model: Video,
          attributes: [],
          include: {
            model: CCTV,
            attributes: [],
            include: {
              model: FacilityArea,
              attributes: [],
              include: {
                model: ChildCareCenter,
                attributes: ["center_name", "address"],
                where: filters,
              },
            },
          },
        },
        attributes: [
          "start_time",
          "end_time",
          "follow_up",
          [
            Sequelize.col(
              "Video.CCTV.FacilityArea.ChildCareCenter.center_name"
            ),
            "center_name",
          ],
          [
            Sequelize.col("Video.CCTV.FacilityArea.ChildCareCenter.address"),
            "address",
          ],
        ],
      });
      res.json(anomalies);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(async (req, res, next) => {
    const { video, ...anomaly } = req.body;
    try {
      const [video_obj, created] = await Video.findOrCreate({
        where: {
          record_date: video.record_date,
          cctv_id: video.cctv_id,
        },
        defaults: {
          storage_name: video.storage_name,
        },
      });
      const anomaly_obj = await Anomaly.create({
        video_id: video_obj.video_id,
        ...anomaly,
      });
      res.json(anomaly_obj);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.get("/:anomaly_id", async (req, res, next) => {
  try {
    const anomaly = await Anomaly.findOne({
      where: { anomaly_id: req.params.anomaly_id },
    });
    res.json(anomaly);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
