import { DefaultSessionUid, LoggedInSessionConfig, ILoggedInSession } from './interfaces';
export default class LoggedInSession<SessionUid = DefaultSessionUid> implements ILoggedInSession<SessionUid> {
    uid: SessionUid;
    data: Object;
    updatedTime: number;
    active: boolean;
    constructor({ uid, data, updatedTime, active, }: LoggedInSessionConfig<SessionUid>);
}
