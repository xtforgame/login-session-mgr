"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserSessionManager = exports.LoggedInUser = void 0;

var _sessionManager = require("./session-manager");

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoggedInUser = function LoggedInUser(_ref) {
  var uid = _ref.uid,
      _ref$data = _ref.data,
      data = _ref$data === void 0 ? {} : _ref$data,
      _ref$sessions = _ref.sessions,
      sessions = _ref$sessions === void 0 ? {} : _ref$sessions;

  _classCallCheck(this, LoggedInUser);

  this.uid = uid;
  this.data = data;
  this.sessions = sessions;
};

exports.LoggedInUser = LoggedInUser;

var UserSessionManager = function () {
  function UserSessionManager(options) {
    _classCallCheck(this, UserSessionManager);

    var o = options || {};
    (0, _sessionManager.assignCallbackFuncs)(this, o, true, 'Session');
    (0, _sessionManager.assignCallbackFuncs)(this, o, true, 'User');
    this.UserInfoClass = o.UserInfoClass || LoggedInUser;
    this.SessionInfoClass = o.SessionInfoClass || _sessionManager.LoggedInSession;
    this.sessionManager = new _sessionManager.SessionManager({
      onLoggedIn: this.onSessionLoggedIn.bind(this),
      onDuplicateLogin: this.onSessionDuplicateLogin.bind(this),
      onUnexpectedLoggedOut: this.onSessionUnexpectedLoggedOut.bind(this),
      onReloggedIn: this.onSessionReloggedIn.bind(this),
      onLoggedOut: this.onSessionLoggedOut.bind(this),
      SessionInfoClass: this.SessionInfoClass
    });
    this._users = {};
  }

  _createClass(UserSessionManager, [{
    key: "addUser",
    value: function addUser(userUid, user) {
      return this._users[userUid] = user;
    }
  }, {
    key: "removeUser",
    value: function removeUser(userUid) {
      delete this._users[userUid];
    }
  }, {
    key: "findUser",
    value: function findUser(userUid) {
      return this._users[userUid];
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
        user.sessions[sessionUid] = newSession;

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
    value: function logout(sessionUid) {
      var _this2 = this;

      var reason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return this.sessionManager.logout(sessionUid, reason).then(function (existedSession) {
        if (!existedSession) {
          return existedSession;
        }

        var userUid = existedSession.user.uid;

        var user = _this2.findUser(userUid);

        delete user.sessions[sessionUid];

        if (Object.keys(user.sessions).length === 0) {
          _this2.removeUser(userUid);

          _this2.onUserLoggedOut(user);
        }

        return existedSession;
      });
    }
  }, {
    key: "onSessionLoggedIn",
    value: function onSessionLoggedIn(session) {
      this._onSessionLoggedIn(session);
    }
  }, {
    key: "onSessionDuplicateLogin",
    value: function onSessionDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin) {
      this._onSessionDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin);
    }
  }, {
    key: "onSessionUnexpectedLoggedOut",
    value: function onSessionUnexpectedLoggedOut(session, reason) {
      this._onSessionUnexpectedLoggedOut(session, reason);
    }
  }, {
    key: "onSessionReloggedIn",
    value: function onSessionReloggedIn(session, newData) {
      this._onSessionReloggedIn(session, newData);
    }
  }, {
    key: "onSessionLoggedOut",
    value: function onSessionLoggedOut(session, reason) {
      this._onSessionLoggedOut(session, reason);
    }
  }, {
    key: "onUserLoggedIn",
    value: function onUserLoggedIn(user) {
      this._onUserLoggedIn(user);
    }
  }, {
    key: "onUserLoggedOut",
    value: function onUserLoggedOut(user, reason) {
      this._onUserLoggedOut(user, reason);
    }
  }, {
    key: "users",
    get: function get() {
      return this._users;
    }
  }]);

  return UserSessionManager;
}();

exports.UserSessionManager = UserSessionManager;

_defineProperty(UserSessionManager, "LogoutReason", _sessionManager.SessionManager.LogoutReason);

_defineProperty(UserSessionManager, "ErrorMessage", _sessionManager.SessionManager.ErrorMessage);