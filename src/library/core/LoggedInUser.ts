/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  DefaultSessionUid,
  DefaultUserUid,
  LoggedInUserConfig,
  ILoggedInUser,
} from './interfaces';
import LoggedInSession from './LoggedInSession';

export default class LoggedInUser<
  UserUid = DefaultUserUid,
  SessionUid = DefaultSessionUid,
  SessionInfo = LoggedInSession<SessionUid>
>
  implements ILoggedInUser<SessionInfo, UserUid, SessionUid>
{
  uid : UserUid;
  data : Object;
  sessionMap : Map<SessionUid, SessionInfo>;

  constructor({
    uid,
    data = {},
  } : LoggedInUserConfig<UserUid>) {
    this.uid = uid;
    this.data = data;
    this.sessionMap = new Map<SessionUid, SessionInfo>();
  }
}
