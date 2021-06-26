import express from "express";
import { Sequelize } from "sequelize";
import ChildCareCenter from "../../DB/models/transform/childCareCenter";
import CCTV from "../../DB/models/transform/cctv";
import Video from "../../DB/models/transform/video";
import Anomaly from "../../DB/models/transform/anomaly";

const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const { center_id, center_name } = req.query;
      let centerFilters = {};
      if (center_id) {
        centerFilters.center_id = center_id;
      }
      if (center_name) {
        centerFilters.center_name = center_name;
      }

      let startDate = new Date();
      const endDate = new Date();
      startDate.setDate(endDate.getDate() - 60);
      const videoFilters = {
        record_date: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      };

      const anomalies = await Anomaly.findAll({
        include: {
          model: Video,
          attributes: [],
          where: videoFilters,
          include: {
            model: CCTV,
            attributes: [],
            include: {
              model: ChildCareCenter,
              attributes: ["center_name", "address"],
              where: centerFilters,
            },
          },
        },
        attributes: [
          "start_time",
          "end_time",
          "follow_up",
          "anomaly_type",
          [
            Sequelize.col("Video.CCTV.ChildCareCenter.center_name"),
            "center_name",
          ],
          [Sequelize.col("Video.CCTV.ChildCareCenter.address"), "address"],
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
      res.status(201).json(anomaly_obj);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;
