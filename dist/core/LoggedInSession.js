"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LoggedInSession = function LoggedInSession(_ref) {
  var uid = _ref.uid,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? {} : _ref$data,
      _ref$updatedTime = _ref.updatedTime,
      updatedTime = _ref$updatedTime === void 0 ? new Date().getTime() : _ref$updatedTime,
      _ref$active = _ref.active,
      active = _ref$active === void 0 ? true : _ref$active;

  _classCallCheck(this, LoggedInSession);

  _defineProperty(this, "uid", void 0);

  _defineProperty(this, "data", void 0);

  _defineProperty(this, "updatedTime", void 0);

  _defineProperty(this, "active", void 0);

  this.uid = uid;
  this.data = data;
  this.updatedTime = updatedTime;
  this.active = active;
};

exports["default"] = LoggedInSession;