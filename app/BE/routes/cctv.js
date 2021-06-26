import express from "express";
import { Sequelize } from "sequelize";
import CCTV from "../../DB/models/transform/cctv";

const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const { center_id } = req.query;
      let filters = {};
      if (center_id) {
        filters.center_id = center_id;
      }
      const cctvs = await CCTV.findAll({
        include: {
          model: Center,
          attributes: ["center_id", "center_name", "address"],
          where: filters,
        },
        attributes: [
          "cctv_id",
          "cctv_name",
          "cctv_mac",
          "install_date",
          "uninstall_date",
          "quality",
          [Sequelize.col("CCTV.ChildCareCenter.center_id"), "center_id"],
          [Sequelize.col("CCTV.ChildCareCenter.center_name"), "center_name"],
          [Sequelize.col("CCTV.ChildCareCenter.address"), "address"],
        ],
      });
      res.json(cctvs);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const cctv = await CCTV.create({
        center_id: req.body.center_id,
        cctv_name: req.body.cctv_name,
        cctv_mac: req.body.cctv_mac,
        install_date: req.body.install_date,
        uninstall_date: req.body.uninstall_date,
        quality: req.body.quality,
      });
      res.status(201).json(cctv);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router
  .route("/:cctv_mac")
  .put(async (req, res, next) => {
    try {
      const cctv = await CCTV.update(
        {
          cctv_name: req.body.cctv_name,
          install_date: req.body.install_date,
          uninstall_date: req.body.uninstall_date,
          quality: req.body.quality,
        },
        {
          where: {
            cctv_mac: req.params.cctv_mac,
          },
        }
      );
      res.json(cctv);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      await CCTV.destroy({
        where: {
          cctv_mac: req.params.cctv_mac,
        },
      });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;
