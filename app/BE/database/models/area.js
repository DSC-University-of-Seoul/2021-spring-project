import Sequelize from "sequelize";

module.exports = class Area extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        area_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        area_name: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        use_of_area: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        paranoids: false,
        modelName: "Area",
        tableName: "area",
        charset: "utf8",
        collate: "utf8_general_cli",
      }
    );
  }
  static associate(db) {
    db.Area.hasMany(db.CdrCareCenter, {
      foreignKey: "area_id",
      sourceKey: "area_id",
    });
  }
};
