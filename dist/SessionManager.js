"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _interfaces = require("./core/interfaces");

var _LoggedInSession = _interopRequireDefault(require("./core/LoggedInSession"));

var _ActivityMap = _interopRequireDefault(require("./core/ActivityMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SessionManager = function () {
  function SessionManager(options) {
    _classCallCheck(this, SessionManager);

    _defineProperty(this, "SessionInfoClass", void 0);

    _defineProperty(this, "_activityMap", void 0);

    _defineProperty(this, "getLogoutReasons", void 0);

    _defineProperty(this, "getErrorMessages", void 0);

    _defineProperty(this, "onLoggedIn", void 0);

    _defineProperty(this, "onDuplicateLogin", void 0);

    _defineProperty(this, "onUnexpectedLoggedOut", void 0);

    _defineProperty(this, "onReloggedIn", void 0);

    _defineProperty(this, "onLoggedOut", void 0);

    var o = options || {};
    this.SessionInfoClass = o.SessionInfoClass || _LoggedInSession["default"];
    this.getLogoutReasons = o.LogoutReasonsProvider || _interfaces.defaultLogoutReasonsProvider;
    this.getErrorMessages = o.ErrorMessagesProvider || _interfaces.defaultErrorMessagesProvider;
    this._activityMap = new _ActivityMap["default"]();
    var onLoggedIn = options.onLoggedIn,
        onDuplicateLogin = options.onDuplicateLogin,
        onUnexpectedLoggedOut = options.onUnexpectedLoggedOut,
        onReloggedIn = options.onReloggedIn,
        onLoggedOut = options.onLoggedOut;

    this.onLoggedIn = onLoggedIn || function (session) {};

    this.onDuplicateLogin = onDuplicateLogin || function (existedSession, newSession, logoutExistedOne, denyLogin) {
      logoutExistedOne();
      denyLogin();
    };

    this.onUnexpectedLoggedOut = onUnexpectedLoggedOut || function (session, reason) {};

    this.onReloggedIn = onReloggedIn || function (session, newData) {};

    this.onLoggedOut = onLoggedOut || function (session, reason) {};
  }

  _createClass(SessionManager, [{
    key: "login",
    value: function login(uid) {
      var _this = this;

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
          _this.logout(uid, _this.getLogoutReasons().DuplicateLogin);

          loggedOutExistedSession = true;
        };

        var loginDenied = false;

        var denyLogin = function denyLogin() {
          loginDenied = true;
        };

        this.onDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin);

        if (loginDenied) {
          return Promise.reject(new Error(this.getErrorMessages().DuplicateLogin));
        }

        if (!loggedOutExistedSession) {
          return Promise.reject(new Error(this.getErrorMessages().OnDuplicateLogin));
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

      return Promise.reject(new Error(this.getErrorMessages().ReloginNotFound));
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
      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var existedSession = this._activityMap.remove(uid, true);

      if (existedSession) {
        this.onLoggedOut(existedSession, reason || this.getLogoutReasons().RegularLogout);
      }

      return Promise.resolve(existedSession);
    }
  }, {
    key: "logoutInactiveSessions",
    value: function logoutInactiveSessions(filter) {
      var _this2 = this;

      this.inactiveSessions.forEach(function (v, uid) {
        var filterResult = filter(v);

        if (filterResult) {
          _this2.logout(uid, _this2.getLogoutReasons().InactiveExpired);
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

exports["default"] = SessionManager;