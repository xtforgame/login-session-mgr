/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  DefaultSessionUid,
  ILoggedInSession,
  ISessionInfoClass,

  DefaultUserUid,
  ILoggedInUser,
  IUserInfoClass,

  LogoutReasonsProvider,
  ErrorMessagesProvider,

  LogoutReason,

  DataMergeFunction,
  defaultLogoutReasonsProvider,
  defaultErrorMessagesProvider,
} from './core/interfaces';
import LoggedInSession from './core/LoggedInSession';
import LoggedInUser from './core/LoggedInUser';

import {
  OnLoggedInFunction,
  LogoutExistedOneInFunction,
  DenyLoginFunction,
  OnDuplicateLoginFunction,
  OnUnexpectedLoggedOutFunction,
  OnReloggedInFunction,
  OnLoggedOutFunction,

  OnUserLoggedInFunction,
  OnUserLoggedOutFunction,
} from './core/functionTypes';

import SessionManager from './SessionManager';

export default class UserSessionManager<
  SessionUid = DefaultSessionUid,
  SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>,

  UserUid = DefaultUserUid,
  UserInfo extends ILoggedInUser<SessionInfo, UserUid, SessionUid>
    = LoggedInUser<UserUid, SessionUid, SessionInfo>
> {
  SessionInfoClass: ISessionInfoClass;
  UserInfoClass : IUserInfoClass;
  sessionManager : SessionManager<SessionUid, SessionInfo>;
  _userMap : Map<UserUid, UserInfo>;
  getLogoutReasons: LogoutReasonsProvider;
  getErrorMessages: ErrorMessagesProvider;

  // functions
  onSessionLoggedIn : OnLoggedInFunction<SessionInfo>;
  onSessionDuplicateLogin : OnDuplicateLoginFunction<SessionInfo>;
  onSessionUnexpectedLoggedOut : OnUnexpectedLoggedOutFunction<SessionInfo>;
  onSessionReloggedIn : OnReloggedInFunction<SessionInfo>;
  onSessionLoggedOut : OnLoggedOutFunction<SessionInfo>;

  onUserLoggedIn : OnUserLoggedInFunction<UserInfo>;
  onUserLoggedOut : OnUserLoggedOutFunction<UserInfo>;

  constructor(options: {
    SessionInfoClass?: ISessionInfoClass,
    UserInfoClass?: IUserInfoClass;
    LogoutReasonsProvider?: LogoutReasonsProvider,
    ErrorMessagesProvider?: ErrorMessagesProvider,

    onSessionLoggedIn?: OnLoggedInFunction<SessionInfo>,
    onSessionDuplicateLogin?: OnDuplicateLoginFunction<SessionInfo>,
    onSessionUnexpectedLoggedOut?: OnUnexpectedLoggedOutFunction<SessionInfo>,
    onSessionReloggedIn?: OnReloggedInFunction<SessionInfo>,
    onSessionLoggedOut?: OnLoggedOutFunction<SessionInfo>,

    onUserLoggedIn?: OnUserLoggedInFunction<UserInfo>,
    onUserLoggedOut?: OnUserLoggedOutFunction<UserInfo>,
  }) {
    const o = options || {};

    this.SessionInfoClass = o.SessionInfoClass || LoggedInSession;
    this.UserInfoClass = o.UserInfoClass || LoggedInUser;
    this.getLogoutReasons = o.LogoutReasonsProvider || defaultLogoutReasonsProvider;
    this.getErrorMessages = o.ErrorMessagesProvider || defaultErrorMessagesProvider;

    // functions
    const {
      onSessionLoggedIn,
      onSessionDuplicateLogin,
      onSessionUnexpectedLoggedOut,
      onSessionReloggedIn,
      onSessionLoggedOut,

      onUserLoggedIn,
      onUserLoggedOut,
    } = options;

    this.onSessionLoggedIn = onSessionLoggedIn
      || ((session : SessionInfo) => {});
    this.onSessionDuplicateLogin = onSessionDuplicateLogin
      || ((
        existedSession : SessionInfo,
        newSession : SessionInfo,
        logoutExistedOne : LogoutExistedOneInFunction<SessionInfo>,
        denyLogin : DenyLoginFunction<SessionInfo>,
      ) => {
        // can do anyone or both of them
        logoutExistedOne();
        denyLogin();
      });
    this.onSessionUnexpectedLoggedOut = onSessionUnexpectedLoggedOut
      || ((session : SessionInfo, reason : LogoutReason) => {});
    this.onSessionReloggedIn = onSessionReloggedIn
      || ((session : SessionInfo, newData : Object) => {});
    this.onSessionLoggedOut = onSessionLoggedOut
      || ((session : SessionInfo, reason : LogoutReason) => {});

    this.onUserLoggedIn = onUserLoggedIn
      || ((user : UserInfo) => {});
    this.onUserLoggedOut = onUserLoggedOut
      || ((user : UserInfo, reason : LogoutReason) => {});

    this.sessionManager = new SessionManager<SessionUid, SessionInfo>({
      onLoggedIn: this.onSessionLoggedIn,
      onDuplicateLogin: this.onSessionDuplicateLogin,
      onUnexpectedLoggedOut: this.onSessionUnexpectedLoggedOut,
      onReloggedIn: this.onSessionReloggedIn,
      onLoggedOut: this.onSessionLoggedOut,
      SessionInfoClass: this.SessionInfoClass,
    });
    this._userMap = new Map<UserUid, UserInfo>();
  }

  addUser(userUid : UserUid, user : UserInfo) {
    this._userMap.set(userUid, user);
    return user;
  }

  removeUser(userUid : UserUid) {
    this._userMap.delete(userUid);
  }

  findUser(userUid : UserUid) {
    return this._userMap.get(userUid);
  }

  get userMap() {
    return this._userMap;
  }

  login(userUid : UserUid, sessionUid : SessionUid, sessionData : Object = {}) {
    return this.sessionManager.login(sessionUid, sessionData)
    .then((newSession) => {
      let user = this.findUser(userUid);
      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        user = <UserInfo><any>new this.UserInfoClass({ uid: userUid });
        this.addUser(userUid, user);
      }
      newSession.user = user;
      user.sessionMap.set(sessionUid, newSession);
      if (isNewUser) {
        this.onUserLoggedIn(user);
      }
      return user;
    });
  }

  unexpectedLogout(sessionUid : SessionUid, reason : LogoutReason) {
    return this.sessionManager.unexpectedLogout(sessionUid, reason);
  }

  relogin(sessionUid : SessionUid, data = {}, mergeFunc : DataMergeFunction) {
    return this.sessionManager.relogin(sessionUid, data, mergeFunc);
  }

  logout(sessionUid : SessionUid, reason : LogoutReason) {
    return this.sessionManager.logout(sessionUid, reason)
    .then((existedSession : SessionInfo | void) => {
      if (!existedSession) {
        return existedSession;
      }
      const userUid = existedSession.user.uid;
      const user = <UserInfo>this.findUser(userUid);
      user.sessionMap.delete(sessionUid);
      if (user.sessionMap.size === 0) {
        this.removeUser(userUid);
        this.onUserLoggedOut(user, reason);
      }
      return existedSession;
    });
  }
}
