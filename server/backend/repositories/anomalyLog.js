import { AnomalyLog, Sequelize } from "../../database/models/transform";
import getPagination from "../utils/getPagination";

const findAllLogs = async (listSize, page, range) => {
  const { offset, limit } = await getPagination(listSize, page, range);

  const endDate = new Date();
  let startDate = new Date();
  endDate.setHours(endDate.getHours() + 9);
  startDate.setDate(endDate.getDate() - 60);

  const anomalyLogs = await AnomalyLog.findAndCountAll({
    where: {
      record_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    offset: offset,
    limit: limit,
    raw: true,
  });

  anomalyLogs.count = {
    listCount: anomalyLogs.count,
    pageCount: Math.ceil(anomalyLogs.count / listSize),
  };
  return anomalyLogs;
};

const findRecentLogs = async (listSize, page, range) => {
  const { offset, limit } = await getPagination(listSize, page, range);
  const endDate = new Date();
  let startDate = new Date();
  endDate.setHours(endDate.getHours() + 9);
  startDate.setDate(endDate.getDate() - 1);

  const anomalyLogs = await AnomalyLog.findAndCountAll({
    where: {
      record_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    offset: offset,
    limit: limit,
    raw: true,
  });

  anomalyLogs.count = {
    listCount: anomalyLogs.count,
    pageCount: Math.ceil(anomalyLogs.count / listSize),
  };
  return anomalyLogs;
};

export default { findAllLogs, findRecentLogs };
