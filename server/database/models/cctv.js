import Sequelize from "sequelize";

/**
 * 설치된 cctv 관련 테이블
 * <FIELDS>           <DATA TYPE>        <INDEX>   <NULLABLE>
 * cctv_id            : Integer          PK        FALSE
 * cctv_name          : String                     FALSE
 * cctv_mac           : STRING                     FALSE
 * quality            : Enum                       FALSE
 * install_date       : Date                       FALSE
 * uninstall_date     : Date                       TRUE
 *
 * <RELATIONSHIP>     <COLUMN>
 * center             : center_id          FK       FALSE
 *
 * <BACKREF>          <COLUMN>
 * video              : cctv_id          FK
 */

module.exports = class CCTV extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        cctv_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        cctv_name: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        cctv_mac: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        quality: {
          type: DataTypes.ENUM({
            values: ["SD", "HD", "FHD", "QHD", "UHD"],
          }),
          allowNull: false,
        },
        install_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        uninstall_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        paranoid: false,
        modelName: "CCTV",
        tableName: "cctv",
        freezeTableName: false,
        charset: "utf8",
        collate: "utf8_general_cli",
      }
    );
  }
  static associate(db) {
    db.CCTV.belongsTo(db.ChildCareCenter, {
      foreignKey: "center_id",
      targetKey: "center_id",
    });
    db.CCTV.hasMany(db.Video, {
      foreignKey: "cctv_id",
      sourceKey: "cctv_id",
    });
  }
};
