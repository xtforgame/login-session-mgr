/* eslint-disable no-underscore-dangle, no-param-reassign */

import {
  LoggedInSession,
  assignCallbackFuncs,
  SessionManager,
} from './session-manager';

export class LoggedInUser {
  constructor({
    uid,
    data = {},
    sessions = {},
  }) {
    this.uid = uid;
    this.data = data;
    this.sessions = sessions;
  }
}

export class UserSessionManager {
  static LogoutReason = SessionManager.LogoutReason;

  static ErrorMessage = SessionManager.ErrorMessage;

  constructor(options) {
    const o = options || {};
    assignCallbackFuncs(this, o, true, 'Session');
    assignCallbackFuncs(this, o, true, 'User');

    this.UserInfoClass = o.UserInfoClass || LoggedInUser;
    this.SessionInfoClass = o.SessionInfoClass || LoggedInSession;

    this.sessionManager = new SessionManager({
      onLoggedIn: this.onSessionLoggedIn.bind(this),
      onDuplicateLogin: this.onSessionDuplicateLogin.bind(this),
      onUnexpectedLoggedOut: this.onSessionUnexpectedLoggedOut.bind(this),
      onReloggedIn: this.onSessionReloggedIn.bind(this),
      onLoggedOut: this.onSessionLoggedOut.bind(this),
      SessionInfoClass: this.SessionInfoClass,
    });
    this._users = {};
  }

  addUser(userUid, user) {
    return (this._users[userUid] = user);
  }

  removeUser(userUid) {
    delete this._users[userUid];
  }

  findUser(userUid) {
    return this._users[userUid];
  }

  get users() {
    return this._users;
  }

  login(userUid, sessionUid, sessionData = {}) {
    return this.sessionManager.login(sessionUid, sessionData)
    .then((newSession) => {
      let user = this.findUser(userUid);
      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        user = new this.UserInfoClass({ uid: userUid });
        this.addUser(userUid, user);
      }
      newSession.user = user;
      user.sessions[sessionUid] = newSession;
      if (isNewUser) {
        this.onUserLoggedIn(user);
      }
      return user;
    });
  }

  unexpectedLogout(sessionUid, reason) {
    return this.sessionManager.unexpectedLogout(sessionUid, reason);
  }

  relogin(sessionUid, data = {}, mergeFunc) {
    return this.sessionManager.relogin(sessionUid, data, mergeFunc);
  }

  logout(sessionUid, reason = null) {
    return this.sessionManager.logout(sessionUid, reason)
    .then((existedSession) => {
      if (!existedSession) {
        return existedSession;
      }
      const userUid = existedSession.user.uid;
      const user = this.findUser(userUid);
      delete user.sessions[sessionUid];
      if (Object.keys(user.sessions).length === 0) {
        this.removeUser(userUid);
        this.onUserLoggedOut(user);
      }
      return existedSession;
    });
  }

  // ===============================

  onSessionLoggedIn(session) {
    this._onSessionLoggedIn(session);
  }

  onSessionDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin) {
    this._onSessionDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin);
  }

  onSessionUnexpectedLoggedOut(session, reason) {
    this._onSessionUnexpectedLoggedOut(session, reason);
  }

  onSessionReloggedIn(session, newData) {
    this._onSessionReloggedIn(session, newData);
  }

  onSessionLoggedOut(session, reason) {
    this._onSessionLoggedOut(session, reason);
  }

  // ===============================

  onUserLoggedIn(user) {
    // console.log('user :', user); // eslint-disable-line no-console
    this._onUserLoggedIn(user);
  }

  // onUserDuplicateLogin(existedUser, newUser, logoutExistedOne, denyLogin){

  // }

  // onUserUnexpectedLoggedOut(user, reason){

  // }

  // onUserReloggedIn(user, newData){

  // }

  onUserLoggedOut(user, reason) {
    this._onUserLoggedOut(user, reason);
  }
}
