"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class requester extends Model {
    static associate(models) {
      requester.hasMany(models.video_management, {
        foreignKey: "requester_id",
        sourceKey: "requester_id",
      });
    }
  }
  requester.init(
    {
      requester_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requester_type: {
        type: DataTypes.ENUM({
          values: ["아동보호자", "보육교사", "원장", "수사기관"],
        }),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "requester",
      tableName: "requester",
      freezeTableName: false,
      timestamps: false,
    }
  );
  return requester;
};
