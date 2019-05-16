/* eslint-disable no-underscore-dangle, no-param-reassign */

// session
export type ValidKey = string | number | Symbol;
export type DefaultSessionUid = ValidKey;

export interface LoggedInSessionConfig<SessionUid = DefaultSessionUid> {
  uid : SessionUid;
  data? : Object;
  updatedTime? : number;
  active? : boolean;
  [index: string] : any;
  [index: number] : any;
}

export interface ILoggedInSession<SessionUid = DefaultSessionUid> {
  uid : SessionUid;
  data : Object;
  updatedTime : number;
  active : boolean;
  [index: string] : any;
  [index: number] : any;
}
export interface ISessionInfoClass {
  new <SessionUid>(...args : any[]) : ILoggedInSession<SessionUid>;
}

// user
export type DefaultUserUid = DefaultSessionUid;
export interface LoggedInUserConfig<UserUid = DefaultUserUid> {
  uid : UserUid;
  data? : Object;
  [index: string] : any;
  [index: number] : any;
}

export interface ILoggedInUser<
  SessionInfo,
  UserUid = DefaultUserUid,
  SessionUid = DefaultSessionUid,
> {
  uid : UserUid;
  data : Object;
  sessionMap : Map<SessionUid, SessionInfo>;
  [index: string] : any;
  [index: number] : any;
}
export interface IUserInfoClass {
  new <UserUid, SessionUid, SessionInfo>(...args : any[])
    : ILoggedInUser<SessionInfo, UserUid, SessionUid>;
}

// common
export type DataMergeFunction = (obj1 : Object, obj2 : Object) => Object;

export type LogoutReason = string;
export interface ILogoutReasons {
  RegularLogout: LogoutReason;
  DuplicateLogin: LogoutReason;
  InactiveExpired: LogoutReason;
}
export type LogoutReasonsProvider = () => ILogoutReasons;

export type ErrorMessage = string;
export interface IErrorMessages {
  DuplicateLogin: ErrorMessage;
  OnDuplicateLogin: ErrorMessage;
  ReloginNotFound: ErrorMessage;
}
export type ErrorMessagesProvider = () => IErrorMessages;

export const defaultLogoutReasonsProvider = () => ({
  RegularLogout: 'RegularLogout',
  DuplicateLogin: 'DuplicateLogin',
  InactiveExpired: 'Expired in inactive section',
});

export const defaultErrorMessagesProvider = () => ({
  DuplicateLogin: 'DuplicateLogin',
  OnDuplicateLogin: 'You must call at least one of "logoutExistedOne" or "denyLogin" functions in the "onDuplicateLogin" callback',
  ReloginNotFound: 'Session not found',
});
