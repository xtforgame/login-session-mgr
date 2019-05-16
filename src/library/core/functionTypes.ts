/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  LogoutReason,
} from './interfaces';

// session
export type OnLoggedInFunction<SessionInfo> = (session : SessionInfo) => any;

export type LogoutExistedOneInFunction<SessionInfo> = () => any;
export type DenyLoginFunction<SessionInfo> = () => any;
export type OnDuplicateLoginFunction<SessionInfo> = (
  existedSession : SessionInfo,
  newSession : SessionInfo,
  logoutExistedOne : LogoutExistedOneInFunction<SessionInfo>,
  denyLogin : DenyLoginFunction<SessionInfo>,
) => any;

export type OnUnexpectedLoggedOutFunction<SessionInfo> = (
  session : SessionInfo,
  reason : LogoutReason,
) => any;

export type OnReloggedInFunction<SessionInfo> = (
  session : SessionInfo,
  newData : Object,
) => any;

export type OnLoggedOutFunction<SessionInfo> = (
  session : SessionInfo,
  reason : LogoutReason,
) => any;

// user
export type OnUserLoggedInFunction<UserInfo> = (
  user : UserInfo,
) => any;

export type OnUserLoggedOutFunction<UserInfo> = (
  user : UserInfo,
  reason : LogoutReason,
) => any;
