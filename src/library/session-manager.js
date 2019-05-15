/* eslint-disable no-underscore-dangle, no-param-reassign */
export class LoggedInSession {
  constructor({
    uid,
    data = {},
    updatedTime = new Date().getTime(),
    active = true,
  }) {
    this.uid = uid;
    this.data = data;
    this.updatedTime = updatedTime;
    this.active = active;
  }
}

export class ActivityMap {
  constructor() {
    this._map = {};
    this._inactiveMap = {};
  }

  // without checking duplicate key
  add(key, value) {
    this._map[key] = value;
  }

  // without checking duplicate key
  moveToInactive(key, modifyFunc = (value => value)) {
    const value = this.find(key);
    if (!value) {
      return value;
    }
    delete this._map[key];
    const newValue = modifyFunc(value);
    return (this._inactiveMap[key] = newValue);
  }

  // without checking duplicate key
  moveToActive(key, modifyFunc = (value => value)) {
    const value = this.findInInactive(key);
    if (!value) {
      return value;
    }
    delete this._inactiveMap[key];
    const newValue = modifyFunc(value);
    return (this._map[key] = newValue);
  }

  removeFromInactive(key) {
    const value = this.findInInactive(key);
    if (!value) {
      return value;
    }
    delete this._inactiveMap[key];
    return value;
  }

  remove(key, includingInactive = false) {
    const value = this.find(key);
    if (!value) {
      return (includingInactive && this.removeFromInactive(key)) || value;
    }
    delete this._map[key];
    return value;
  }

  findInInactive(key) {
    return this._inactiveMap[key];
  }

  find(key, includingInactive = false) {
    return this._map[key] || (includingInactive && this.findInInactive(key));
  }

  hasInInactive(key) {
    return !!this.findInInactive(key);
  }

  has(key, includingInactive = false) {
    return !!this.find(key, includingInactive);
  }

  getState(key) {
    if (this.has(key)) {
      return 'active';
    }
    if (this.hasInInactive(key)) {
      return 'inactive';
    }
    return null;
  }

  get activeMap() {
    return this._map;
  }

  get inactiveMap() {
    return this._inactiveMap;
  }
}

export function assignCallbackFuncs(_this, options, useUnderscoreForThis = false, prefixForOptions = '') {
  const {
    [`on${prefixForOptions}LoggedIn`]: onLoggedIn = ((session) => {}),
    [`on${prefixForOptions}DuplicateLogin`]: onDuplicateLogin =
    ((existedSession, newSession, logoutExistedOne, denyLogin) => {
      // can do anyone or both of them
      logoutExistedOne();
      denyLogin();
    }),
    [`on${prefixForOptions}UnexpectedLoggedOut`]: onUnexpectedLoggedOut = ((session, reason) => {}),
    [`on${prefixForOptions}ReloggedIn`]: onReloggedIn = ((session, newData) => {}),
    [`on${prefixForOptions}LoggedOut`]: onLoggedOut = ((session, reason) => {}),
  } = options;

  const underscore = useUnderscoreForThis ? '_' : '';
  Object.assign(_this, {
    [`${underscore}on${prefixForOptions}LoggedIn`]: onLoggedIn,
    [`${underscore}on${prefixForOptions}DuplicateLogin`]: onDuplicateLogin,
    [`${underscore}on${prefixForOptions}UnexpectedLoggedOut`]: onUnexpectedLoggedOut,
    [`${underscore}on${prefixForOptions}ReloggedIn`]: onReloggedIn,
    [`${underscore}on${prefixForOptions}LoggedOut`]: onLoggedOut,
  });
}

export class SessionManager {
  static LogoutReason = {
    RegularLogout: 'RegularLogout',
    DuplicateLogin: 'DuplicateLogin',
    InactiveExpired: 'Expired in inactive section',
  };

  static ErrorMessage = {
    DuplicateLogin: 'DuplicateLogin',
    OnDuplicateLogin: 'You must call at least one of "logoutExistedOne" or "denyLogin" functions in the "onDuplicateLogin" callback',
    ReloginNotFound: 'Session not found',
  };

  constructor(options) {
    const o = options || {};
    this.SessionInfoClass = o.SessionInfoClass || LoggedInSession;

    // session = { uid: ...: ..., data: {...}, updatedTime: (new Date().getTime()), active: true }
    this._activityMap = new ActivityMap();

    assignCallbackFuncs(this, o);
  }

  get activeSessions() {
    return this._activityMap.activeMap;
  }

  get inactiveSessions() {
    return this._activityMap.inactiveMap;
  }

  // a regular login
  login(uid, data = {}) {
    const newSession = new this.SessionInfoClass({
      uid,
      data,
      updatedTime: new Date().getTime(),
      active: true,
    });

    const existedSession = this._activityMap.find(uid, true);
    if (existedSession) {
      let loggedOutExistedSession = false;
      const logoutExistedOne = () => {
        this.logout(uid, SessionManager.LogoutReason.DuplicateLogin);
        loggedOutExistedSession = true;
      };

      let loginDenied = false;
      const denyLogin = () => {
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

  // on an unexpected disconnection occurred, use this way to move the session
  // from 'activeSessions' to 'inactiveSessions'
  unexpectedLogout(uid, reason) {
    const existedSession = this._activityMap.find(uid);
    if (existedSession) {
      this._activityMap.moveToInactive(uid, (session) => {
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

  // reconnect after an unexpected disconnection occurred
  relogin(uid, data = {}, mergeFunc) {
    const existedSession = this._activityMap.findInInactive(uid);
    if (existedSession) {
      this._activityMap.moveToActive(uid, (session) => {
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

  find(uid, includingInactive = false) {
    return this._activityMap.find(uid, includingInactive);
  }

  hasInInactive(key) {
    return this._activityMap.hasInInactive(key);
  }

  // a regular logout
  logout(uid, reason = null) {
    reason = reason || SessionManager.LogoutReason.RegularLogout;
    const existedSession = this._activityMap.remove(uid, true);
    if (existedSession) {
      this.onLoggedOut(existedSession, reason);
    }
    return Promise.resolve(existedSession || null);
  }

  logoutInactiveSessions(filter) {
    const { inactiveSessions } = this;
    const uids = Object.keys(inactiveSessions);
    uids.forEach((uid) => {
      const filterResult = filter(inactiveSessions[uid]);
      if (filterResult) {
        this.logout(uid, SessionManager.LogoutReason.InactiveExpired);
      }
    });
  }
}
