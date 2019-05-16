import { DefaultSessionUid, ILoggedInSession } from './interfaces';
import LoggedInSession from './LoggedInSession';
export default class ActivityMap<SessionUid = DefaultSessionUid, SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>> {
    _map: Map<SessionUid, SessionInfo>;
    _inactiveMap: Map<SessionUid, SessionInfo>;
    constructor();
    add(key: SessionUid, value: SessionInfo): void;
    moveToInactive(key: SessionUid, modifyFunc?: (s: SessionInfo) => SessionInfo): void | SessionInfo;
    moveToActive(key: SessionUid, modifyFunc?: (s: SessionInfo) => SessionInfo): SessionInfo | undefined;
    removeFromInactive(key: SessionUid): SessionInfo | undefined;
    remove(key: SessionUid, includingInactive?: boolean): void | SessionInfo;
    findInInactive(key: SessionUid): SessionInfo | undefined;
    find(key: SessionUid, includingInactive?: boolean): SessionInfo | void;
    hasInInactive(key: SessionUid): boolean;
    has(key: SessionUid, includingInactive?: boolean): boolean;
    getState(key: SessionUid): "active" | "inactive" | null;
    readonly activeMap: Map<SessionUid, SessionInfo>;
    readonly inactiveMap: Map<SessionUid, SessionInfo>;
}
