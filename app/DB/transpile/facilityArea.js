"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * 어린이집 내 공간에 대한 테이블
 * <FIELDS>           <DATA TYPE>        <INDEX>   <NULLABLE>
 * area_id            : Integer          PK        FALSE
 * area_name          : String                     FALSE
 * area_usage         : String                     TRUE
 *
 * <RELATIONSHIP>     <COLUMN>
 * cdrcare_center     : center_id        FK        FALSE
 *
 * <BACKREF>          <COLUMN>
 * cctv               : area_id          FK
 */
module.exports = /*#__PURE__*/function (_Sequelize$Model) {
  _inherits(FacilityArea, _Sequelize$Model);

  var _super = _createSuper(FacilityArea);

  function FacilityArea() {
    _classCallCheck(this, FacilityArea);

    return _super.apply(this, arguments);
  }

  _createClass(FacilityArea, null, [{
    key: "init",
    value: function init(sequelize, DataTypes) {
      return _get(_getPrototypeOf(FacilityArea), "init", this).call(this, {
        area_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        area_name: {
          type: DataTypes.STRING(20),
          allowNull: false
        },
        area_usage: {
          type: DataTypes.STRING(10),
          allowNull: true
        }
      }, {
        sequelize: sequelize,
        timestamps: false,
        paranoids: false,
        modelName: "FacilityArea",
        tableName: "facility_area",
        freezeTableName: false,
        charset: "utf8",
        collate: "utf8_general_cli"
      });
    }
  }, {
    key: "associate",
    value: function associate(db) {
      db.FacilityArea.belongsTo(db.ChildCareCenter, {
        foreignKey: "center_id",
        targetKey: "center_id"
      });
      db.FacilityArea.hasMany(db.CCTV, {
        foreignKey: "area_id",
        sourceKey: "area_id"
      });
    }
  }]);

  return FacilityArea;
}(_sequelize["default"].Model);