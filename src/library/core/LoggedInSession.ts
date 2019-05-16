/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  DefaultSessionUid,
  LoggedInSessionConfig,
  ILoggedInSession,
} from './interfaces';

export default class LoggedInSession<SessionUid = DefaultSessionUid>
  implements ILoggedInSession<SessionUid>
{
  uid : SessionUid;
  data : Object;
  updatedTime : number;
  active : boolean;

  constructor({
    uid,
    data = {},
    updatedTime = new Date().getTime(),
    active = true,
  } : LoggedInSessionConfig<SessionUid>) {
    this.uid = uid;
    this.data = data;
    this.updatedTime = updatedTime;
    this.active = active;
  }
}
