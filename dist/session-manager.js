"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assignCallbackFuncs = assignCallbackFuncs;
exports.SessionManager = exports.ActivityMap = exports.LoggedInSession = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoggedInSession = function LoggedInSession(_ref) {
  var uid = _ref.uid,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? {} : _ref$data,
      _ref$updatedTime = _ref.updatedTime,
      updatedTime = _ref$updatedTime === void 0 ? new Date().getTime() : _ref$updatedTime,
      _ref$active = _ref.active,
      active = _ref$active === void 0 ? true : _ref$active;

  _classCallCheck(this, LoggedInSession);

  this.uid = uid;
  this.data = data;
  this.updatedTime = updatedTime;
  this.active = active;
};

exports.LoggedInSession = LoggedInSession;

var ActivityMap = function () {
  function ActivityMap() {
    _classCallCheck(this, ActivityMap);

    this._map = {};
    this._inactiveMap = {};
  }

  _createClass(ActivityMap, [{
    key: "add",
    value: function add(key, value) {
      this._map[key] = value;
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

      delete this._map[key];
      var newValue = modifyFunc(value);
      return this._inactiveMap[key] = newValue;
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

      delete this._inactiveMap[key];
      var newValue = modifyFunc(value);
      return this._map[key] = newValue;
    }
  }, {
    key: "removeFromInactive",
    value: function removeFromInactive(key) {
      var value = this.findInInactive(key);

      if (!value) {
        return value;
      }

      delete this._inactiveMap[key];
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

      delete this._map[key];
      return value;
    }
  }, {
    key: "findInInactive",
    value: function findInInactive(key) {
      return this._inactiveMap[key];
    }
  }, {
    key: "find",
    value: function find(key) {
      var includingInactive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this._map[key] || includingInactive && this.findInInactive(key);
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

exports.ActivityMap = ActivityMap;

function assignCallbackFuncs(_this, options) {
  var _Object$assign;

  var useUnderscoreForThis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var prefixForOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var _options$ = options["on".concat(prefixForOptions, "LoggedIn")],
      onLoggedIn = _options$ === void 0 ? function (session) {} : _options$,
      _options$2 = options["on".concat(prefixForOptions, "DuplicateLogin")],
      onDuplicateLogin = _options$2 === void 0 ? function (existedSession, newSession, logoutExistedOne, denyLogin) {
    logoutExistedOne();
    denyLogin();
  } : _options$2,
      _options$3 = options["on".concat(prefixForOptions, "UnexpectedLoggedOut")],
      onUnexpectedLoggedOut = _options$3 === void 0 ? function (session, reason) {} : _options$3,
      _options$4 = options["on".concat(prefixForOptions, "ReloggedIn")],
      onReloggedIn = _options$4 === void 0 ? function (session, newData) {} : _options$4,
      _options$5 = options["on".concat(prefixForOptions, "LoggedOut")],
      onLoggedOut = _options$5 === void 0 ? function (session, reason) {} : _options$5;
  var underscore = useUnderscoreForThis ? '_' : '';
  Object.assign(_this, (_Object$assign = {}, _defineProperty(_Object$assign, "".concat(underscore, "on").concat(prefixForOptions, "LoggedIn"), onLoggedIn), _defineProperty(_Object$assign, "".concat(underscore, "on").concat(prefixForOptions, "DuplicateLogin"), onDuplicateLogin), _defineProperty(_Object$assign, "".concat(underscore, "on").concat(prefixForOptions, "UnexpectedLoggedOut"), onUnexpectedLoggedOut), _defineProperty(_Object$assign, "".concat(underscore, "on").concat(prefixForOptions, "ReloggedIn"), onReloggedIn), _defineProperty(_Object$assign, "".concat(underscore, "on").concat(prefixForOptions, "LoggedOut"), onLoggedOut), _Object$assign));
}

var SessionManager = function () {
  function SessionManager(options) {
    _classCallCheck(this, SessionManager);

    var o = options || {};
    this.SessionInfoClass = o.SessionInfoClass || LoggedInSession;
    this._activityMap = new ActivityMap();
    assignCallbackFuncs(this, o);
  }

  _createClass(SessionManager, [{
    key: "login",
    value: function login(uid) {
      var _this2 = this;

      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var newSession = new this.SessionInfoClass({
        uid: uid,
        data: data,
        updatedTime: new Date().getTime(),
        active: true
      });

      var existedSession = this._activityMap.find(uid, true);

      if (existedSession) {
        var loggedOutExistedSession = false;

        var logoutExistedOne = function logoutExistedOne() {
          _this2.logout(uid, SessionManager.LogoutReason.DuplicateLogin);

          loggedOutExistedSession = true;
        };

        var loginDenied = false;

        var denyLogin = function denyLogin() {
          loginDenied = true;
        };

        this.onDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin);

        if (loginDenied) {
          return Promise.reject(new Error(SessionManager.ErrorMessage.DuplicateLogin));
        } else if (!loggedOutExistedSession) {
          return Promise.reject(new Error(SessionManager.ErrorMessage.OnDuplicateLogin));
        }
      }

      this._activityMap.add(uid, newSession);

      this.onLoggedIn(newSession);
      return Promise.resolve(newSession);
    }
  }, {
    key: "unexpectedLogout",
    value: function unexpectedLogout(uid, reason) {
      var existedSession = this._activityMap.find(uid);

      if (existedSession) {
        this._activityMap.moveToInactive(uid, function (session) {
          session.updatedTime = new Date().getTime();
          session.active = false;
          return session;
        });
      } else {
        return Promise.resolve(existedSession);
      }

      this.onUnexpectedLoggedOut(existedSession, reason);
      return Promise.resolve(existedSession);
    }
  }, {
    key: "relogin",
    value: function relogin(uid) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var mergeFunc = arguments.length > 2 ? arguments[2] : undefined;

      var existedSession = this._activityMap.findInInactive(uid);

      if (existedSession) {
        this._activityMap.moveToActive(uid, function (session) {
          session.updatedTime = new Date().getTime();

          if (mergeFunc) {
            session.data = mergeFunc(session.data, data);
          }

          return session;
        });

        this.onReloggedIn(existedSession, data);
        return Promise.resolve(existedSession);
      }

      return Promise.reject(new Error(SessionManager.ErrorMessage.ReloginNotFound));
    }
  }, {
    key: "find",
    value: function find(uid) {
      var includingInactive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this._activityMap.find(uid, includingInactive);
    }
  }, {
    key: "hasInInactive",
    value: function hasInInactive(key) {
      return this._activityMap.hasInInactive(key);
    }
  }, {
    key: "logout",
    value: function logout(uid) {
      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      reason = reason || SessionManager.LogoutReason.RegularLogout;

      var existedSession = this._activityMap.remove(uid, true);

      if (existedSession) {
        this.onLoggedOut(existedSession, reason);
      }

      return Promise.resolve(existedSession || null);
    }
  }, {
    key: "logoutInactiveSessions",
    value: function logoutInactiveSessions(filter) {
      var _this3 = this;

      var inactiveSessions = this.inactiveSessions;
      var uids = Object.keys(inactiveSessions);
      uids.forEach(function (uid) {
        var filterResult = filter(inactiveSessions[uid]);

        if (filterResult) {
          _this3.logout(uid, SessionManager.LogoutReason.InactiveExpired);
        }
      });
    }
  }, {
    key: "activeSessions",
    get: function get() {
      return this._activityMap.activeMap;
    }
  }, {
    key: "inactiveSessions",
    get: function get() {
      return this._activityMap.inactiveMap;
    }
  }]);

  return SessionManager;
}();

exports.SessionManager = SessionManager;

_defineProperty(SessionManager, "LogoutReason", {
  RegularLogout: 'RegularLogout',
  DuplicateLogin: 'DuplicateLogin',
  InactiveExpired: 'Expired in inactive section'
});

_defineProperty(SessionManager, "ErrorMessage", {
  DuplicateLogin: 'DuplicateLogin',
  OnDuplicateLogin: 'You must call at least one of "logoutExistedOne" or "denyLogin" functions in the "onDuplicateLogin" callback',
  ReloginNotFound: 'Session not found'
});