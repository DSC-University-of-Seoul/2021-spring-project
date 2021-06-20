import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

import { sequelize } from "./database/models";
import indexRouter from "./routes";
import districtRouter from "./routes/district";
import centerRouter from "./routes/child-care-center";
import areaRouter from "./routes/facility-area";
import cctvRouter from "./routes/cctv";
import videoRouter from "./routes/video";
import anomalyRouter from "./routes/anomaly";
import cors from "cors";

dotenv.config();

const app = express();
app.set("port", process.env.PORT || 3000);

// DB 연결
sequelize
  .sync({ force: false, alter: false })
  .then(() => {
    console.log("DB 연결 성공");
  })
  .catch((err) => {
    console.log("DB 연결 실패");
    console.log(err);
  });

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// localhost:3000/ 연결
app.use("/api/", indexRouter);
app.use("/api/districts/", districtRouter);
app.use("/api/centers/", centerRouter);
app.use("/api/areas/", areaRouter);
app.use("/api/cctvs/", cctvRouter);
app.use("/api/videos/", videoRouter);
app.use("/api/anomalies/", anomalyRouter);

const swaggerSpecs = yaml.load(path.join(__dirname, "/swagger/build.yaml"));
app.use("/api/docs/", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 포트 연결
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "빈 포트에서 대기중.");
});
