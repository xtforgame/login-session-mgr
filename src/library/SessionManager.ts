/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  DefaultSessionUid,
  ILoggedInSession,

  DataMergeFunction,
  ISessionInfoClass,
  LogoutReason,
  LogoutReasonsProvider,
  ErrorMessagesProvider,
  defaultLogoutReasonsProvider,
  defaultErrorMessagesProvider,
} from './core/interfaces';

import {
  OnLoggedInFunction,
  LogoutExistedOneInFunction,
  DenyLoginFunction,
  OnDuplicateLoginFunction,
  OnUnexpectedLoggedOutFunction,
  OnReloggedInFunction,
  OnLoggedOutFunction,
} from './core/functionTypes';

import LoggedInSession from './core/LoggedInSession';
import ActivityMap from './core/ActivityMap';

export default class SessionManager<
  SessionUid = DefaultSessionUid,
  SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>
> {
  SessionInfoClass: ISessionInfoClass;
  _activityMap: ActivityMap<SessionUid, SessionInfo>;
  getLogoutReasons: LogoutReasonsProvider;
  getErrorMessages: ErrorMessagesProvider;

  // functions
  onLoggedIn: OnLoggedInFunction<SessionInfo>;
  onDuplicateLogin : OnDuplicateLoginFunction<SessionInfo>;
  onUnexpectedLoggedOut : OnUnexpectedLoggedOutFunction<SessionInfo>;
  onReloggedIn : OnReloggedInFunction<SessionInfo>;
  onLoggedOut : OnLoggedOutFunction<SessionInfo>;

  constructor(options: {
    SessionInfoClass?: ISessionInfoClass,
    LogoutReasonsProvider?: LogoutReasonsProvider,
    ErrorMessagesProvider?: ErrorMessagesProvider,

    onLoggedIn?: OnLoggedInFunction<SessionInfo>,
    onDuplicateLogin?: OnDuplicateLoginFunction<SessionInfo>,
    onUnexpectedLoggedOut?: OnUnexpectedLoggedOutFunction<SessionInfo>,
    onReloggedIn?: OnReloggedInFunction<SessionInfo>,
    onLoggedOut?: OnLoggedOutFunction<SessionInfo>,
  }) {
    const o = options || {};
    this.SessionInfoClass = o.SessionInfoClass || LoggedInSession;
    this.getLogoutReasons = o.LogoutReasonsProvider || defaultLogoutReasonsProvider;
    this.getErrorMessages = o.ErrorMessagesProvider || defaultErrorMessagesProvider;

    // session = { uid: ...: ..., data: {...}, updatedTime: (new Date().getTime()), active: true }
    this._activityMap = new ActivityMap();

    // functions
    const {
      onLoggedIn,
      onDuplicateLogin,
      onUnexpectedLoggedOut,
      onReloggedIn,
      onLoggedOut,
    } = options;

    this.onLoggedIn = onLoggedIn || ((session : SessionInfo) => {});
    this.onDuplicateLogin = onDuplicateLogin || ((
      existedSession : SessionInfo,
      newSession : SessionInfo,
      logoutExistedOne : LogoutExistedOneInFunction<SessionInfo>,
      denyLogin : DenyLoginFunction<SessionInfo>,
    ) => {
      // can do anyone or both of them
      logoutExistedOne();
      denyLogin();
    });
    this.onUnexpectedLoggedOut = onUnexpectedLoggedOut
      || ((session : SessionInfo, reason : LogoutReason) => {});
    this.onReloggedIn = onReloggedIn || ((session : SessionInfo, newData : Object) => {});
    this.onLoggedOut = onLoggedOut || ((session : SessionInfo, reason : LogoutReason) => {});
  }

  get activeSessions() {
    return this._activityMap.activeMap;
  }

  get inactiveSessions() {
    return this._activityMap.inactiveMap;
  }

  // a regular login
  login(uid : SessionUid, data = {}) {
    const newSession : SessionInfo = <SessionInfo><any>new this.SessionInfoClass<SessionInfo>({
      uid,
      data,
      updatedTime: new Date().getTime(),
      active: true,
    });

    const existedSession = this._activityMap.find(uid, true);
    if (existedSession) {
      let loggedOutExistedSession = false;
      const logoutExistedOne = () => {
        this.logout(uid, this.getLogoutReasons().DuplicateLogin);
        loggedOutExistedSession = true;
      };

      let loginDenied = false;
      const denyLogin = () => {
        loginDenied = true;
      };

      this.onDuplicateLogin(existedSession, newSession, logoutExistedOne, denyLogin);

      if (loginDenied) {
        return Promise.reject(new Error(this.getErrorMessages().DuplicateLogin));
      }  if (!loggedOutExistedSession) {
        return Promise.reject(new Error(this.getErrorMessages().OnDuplicateLogin));
      }
    }

    this._activityMap.add(uid, newSession);
    this.onLoggedIn(newSession);
    return Promise.resolve(newSession);
  }

  // on an unexpected disconnection occurred, use this way to move the session
  // from 'activeSessions' to 'inactiveSessions'
  unexpectedLogout(uid : SessionUid, reason : LogoutReason) {
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
  relogin(uid : SessionUid, data = {}, mergeFunc : DataMergeFunction) {
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
    return Promise.reject(new Error(this.getErrorMessages().ReloginNotFound));
  }

  find(uid : SessionUid, includingInactive = false) {
    return this._activityMap.find(uid, includingInactive);
  }

  hasInInactive(key : SessionUid) {
    return this._activityMap.hasInInactive(key);
  }

  // a regular logout
  logout(uid : SessionUid, reason : LogoutReason = '') {
    const existedSession = this._activityMap.remove(uid, true);
    if (existedSession) {
      this.onLoggedOut(existedSession, reason || this.getLogoutReasons().RegularLogout);
    }
    return Promise.resolve(existedSession);
  }

  logoutInactiveSessions(filter: (s : SessionInfo) => boolean) {
    this.inactiveSessions.forEach((v, uid) => {
      const filterResult = filter(v);
      if (filterResult) {
        this.logout(uid, this.getLogoutReasons().InactiveExpired);
      }
    });
  }
}
