"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _interfaces = require("./core/interfaces");

var _LoggedInSession = _interopRequireDefault(require("./core/LoggedInSession"));

var _LoggedInUser = _interopRequireDefault(require("./core/LoggedInUser"));

var _SessionManager = _interopRequireDefault(require("./SessionManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UserSessionManager = function () {
  function UserSessionManager(options) {
    _classCallCheck(this, UserSessionManager);

    _defineProperty(this, "SessionInfoClass", void 0);

    _defineProperty(this, "UserInfoClass", void 0);

    _defineProperty(this, "sessionManager", void 0);

    _defineProperty(this, "_userMap", void 0);

    _defineProperty(this, "getLogoutReasons", void 0);

    _defineProperty(this, "getErrorMessages", void 0);

    _defineProperty(this, "onSessionLoggedIn", void 0);

    _defineProperty(this, "onSessionDuplicateLogin", void 0);

    _defineProperty(this, "onSessionUnexpectedLoggedOut", void 0);

    _defineProperty(this, "onSessionReloggedIn", void 0);

    _defineProperty(this, "onSessionLoggedOut", void 0);

    _defineProperty(this, "onUserLoggedIn", void 0);

    _defineProperty(this, "onUserLoggedOut", void 0);

    var o = options || {};
    this.SessionInfoClass = o.SessionInfoClass || _LoggedInSession["default"];
    this.UserInfoClass = o.UserInfoClass || _LoggedInUser["default"];
    this.getLogoutReasons = o.LogoutReasonsProvider || _interfaces.defaultLogoutReasonsProvider;
    this.getErrorMessages = o.ErrorMessagesProvider || _interfaces.defaultErrorMessagesProvider;
    var onSessionLoggedIn = options.onSessionLoggedIn,
        onSessionDuplicateLogin = options.onSessionDuplicateLogin,
        onSessionUnexpectedLoggedOut = options.onSessionUnexpectedLoggedOut,
        onSessionReloggedIn = options.onSessionReloggedIn,
        onSessionLoggedOut = options.onSessionLoggedOut,
        onUserLoggedIn = options.onUserLoggedIn,
        onUserLoggedOut = options.onUserLoggedOut;

    this.onSessionLoggedIn = onSessionLoggedIn || function (session) {};

    this.onSessionDuplicateLogin = onSessionDuplicateLogin || function (existedSession, newSession, logoutExistedOne, denyLogin) {
      logoutExistedOne();
      denyLogin();
    };

    this.onSessionUnexpectedLoggedOut = onSessionUnexpectedLoggedOut || function (session, reason) {};

    this.onSessionReloggedIn = onSessionReloggedIn || function (session, newData) {};

    this.onSessionLoggedOut = onSessionLoggedOut || function (session, reason) {};

    this.onUserLoggedIn = onUserLoggedIn || function (user) {};

    this.onUserLoggedOut = onUserLoggedOut || function (user, reason) {};

    this.sessionManager = new _SessionManager["default"]({
      onLoggedIn: this.onSessionLoggedIn,
      onDuplicateLogin: this.onSessionDuplicateLogin,
      onUnexpectedLoggedOut: this.onSessionUnexpectedLoggedOut,
      onReloggedIn: this.onSessionReloggedIn,
      onLoggedOut: this.onSessionLoggedOut,
      SessionInfoClass: this.SessionInfoClass
    });
    this._userMap = new Map();
  }

  _createClass(UserSessionManager, [{
    key: "addUser",
    value: function addUser(userUid, user) {
      this._userMap.set(userUid, user);

      return user;
    }
  }, {
    key: "removeUser",
    value: function removeUser(userUid) {
      this._userMap["delete"](userUid);
    }
  }, {
    key: "findUser",
    value: function findUser(userUid) {
      return this._userMap.get(userUid);
    }
  }, {
    key: "login",
    value: function login(userUid, sessionUid) {
      var _this = this;

      var sessionData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.sessionManager.login(sessionUid, sessionData).then(function (newSession) {
        var user = _this.findUser(userUid);

        var isNewUser = false;

        if (!user) {
          isNewUser = true;
          user = new _this.UserInfoClass({
            uid: userUid
          });

          _this.addUser(userUid, user);
        }

        newSession.user = user;
        user.sessionMap.set(sessionUid, newSession);

        if (isNewUser) {
          _this.onUserLoggedIn(user);
        }

        return user;
      });
    }
  }, {
    key: "unexpectedLogout",
    value: function unexpectedLogout(sessionUid, reason) {
      return this.sessionManager.unexpectedLogout(sessionUid, reason);
    }
  }, {
    key: "relogin",
    value: function relogin(sessionUid) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var mergeFunc = arguments.length > 2 ? arguments[2] : undefined;
      return this.sessionManager.relogin(sessionUid, data, mergeFunc);
    }
  }, {
    key: "logout",
    value: function logout(sessionUid, reason) {
      var _this2 = this;

      return this.sessionManager.logout(sessionUid, reason).then(function (existedSession) {
        if (!existedSession) {
          return existedSession;
        }

        var userUid = existedSession.user.uid;

        var user = _this2.findUser(userUid);

        user.sessionMap["delete"](sessionUid);

        if (user.sessionMap.size === 0) {
          _this2.removeUser(userUid);

          _this2.onUserLoggedOut(user, reason);
        }

        return existedSession;
      });
    }
  }, {
    key: "userMap",
    get: function get() {
      return this._userMap;
    }
  }]);

  return UserSessionManager;
}();

exports["default"] = UserSessionManager;