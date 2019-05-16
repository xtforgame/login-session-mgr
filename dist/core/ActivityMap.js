"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ActivityMap = function () {
  function ActivityMap() {
    _classCallCheck(this, ActivityMap);

    _defineProperty(this, "_map", void 0);

    _defineProperty(this, "_inactiveMap", void 0);

    this._map = new Map();
    this._inactiveMap = new Map();
  }

  _createClass(ActivityMap, [{
    key: "add",
    value: function add(key, value) {
      this._map.set(key, value);
    }
  }, {
    key: "moveToInactive",
    value: function moveToInactive(key) {
      var modifyFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {
        return value;
      };
      var value = this.find(key);

      if (!value) {
        return value;
      }

      this._map["delete"](key);

      var newValue = modifyFunc(value);

      this._inactiveMap.set(key, newValue);

      return newValue;
    }
  }, {
    key: "moveToActive",
    value: function moveToActive(key) {
      var modifyFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {
        return value;
      };
      var value = this.findInInactive(key);

      if (!value) {
        return value;
      }

      this._inactiveMap["delete"](key);

      var newValue = modifyFunc(value);

      this._map.set(key, newValue);

      return newValue;
    }
  }, {
    key: "removeFromInactive",
    value: function removeFromInactive(key) {
      var value = this.findInInactive(key);

      if (!value) {
        return value;
      }

      this._inactiveMap["delete"](key);

      return value;
    }
  }, {
    key: "remove",
    value: function remove(key) {
      var includingInactive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var value = this.find(key);

      if (!value) {
        return includingInactive && this.removeFromInactive(key) || value;
      }

      this._map["delete"](key);

      return value;
    }
  }, {
    key: "findInInactive",
    value: function findInInactive(key) {
      return this._inactiveMap.get(key);
    }
  }, {
    key: "find",
    value: function find(key) {
      var includingInactive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this._map.get(key) || (includingInactive ? this.findInInactive(key) : undefined);
    }
  }, {
    key: "hasInInactive",
    value: function hasInInactive(key) {
      return !!this.findInInactive(key);
    }
  }, {
    key: "has",
    value: function has(key) {
      var includingInactive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return !!this.find(key, includingInactive);
    }
  }, {
    key: "getState",
    value: function getState(key) {
      if (this.has(key)) {
        return 'active';
      }

      if (this.hasInInactive(key)) {
        return 'inactive';
      }

      return null;
    }
  }, {
    key: "activeMap",
    get: function get() {
      return this._map;
    }
  }, {
    key: "inactiveMap",
    get: function get() {
      return this._inactiveMap;
    }
  }]);

  return ActivityMap;
}();

exports["default"] = ActivityMap;