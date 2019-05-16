import { DefaultSessionUid, ILoggedInSession, DataMergeFunction, ISessionInfoClass, LogoutReason, LogoutReasonsProvider, ErrorMessagesProvider } from './core/interfaces';
import { OnLoggedInFunction, OnDuplicateLoginFunction, OnUnexpectedLoggedOutFunction, OnReloggedInFunction, OnLoggedOutFunction } from './core/functionTypes';
import LoggedInSession from './core/LoggedInSession';
import ActivityMap from './core/ActivityMap';
export declare class SessionManager<SessionUid = DefaultSessionUid, SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>> {
    SessionInfoClass: ISessionInfoClass;
    _activityMap: ActivityMap<SessionUid, SessionInfo>;
    getLogoutReasons: LogoutReasonsProvider;
    getErrorMessages: ErrorMessagesProvider;
    onLoggedIn: OnLoggedInFunction<SessionInfo>;
    onDuplicateLogin: OnDuplicateLoginFunction<SessionInfo>;
    onUnexpectedLoggedOut: OnUnexpectedLoggedOutFunction<SessionInfo>;
    onReloggedIn: OnReloggedInFunction<SessionInfo>;
    onLoggedOut: OnLoggedOutFunction<SessionInfo>;
    constructor(options: {
        SessionInfoClass?: ISessionInfoClass;
        LogoutReasonsProvider?: LogoutReasonsProvider;
        ErrorMessagesProvider?: ErrorMessagesProvider;
        onLoggedIn?: OnLoggedInFunction<SessionInfo>;
        onDuplicateLogin?: OnDuplicateLoginFunction<SessionInfo>;
        onUnexpectedLoggedOut?: OnUnexpectedLoggedOutFunction<SessionInfo>;
        onReloggedIn: OnReloggedInFunction<SessionInfo>;
        onLoggedOut: OnLoggedOutFunction<SessionInfo>;
    });
    readonly activeSessions: Map<SessionUid, SessionInfo>;
    readonly inactiveSessions: Map<SessionUid, SessionInfo>;
    login(uid: SessionUid, data?: {}): Promise<SessionInfo>;
    unexpectedLogout(uid: SessionUid, reason: LogoutReason): Promise<void> | Promise<SessionInfo>;
    relogin(uid: SessionUid, data: {} | undefined, mergeFunc: DataMergeFunction): Promise<SessionInfo>;
    find(uid: SessionUid, includingInactive?: boolean): void | SessionInfo;
    hasInInactive(key: SessionUid): boolean;
    logout(uid: SessionUid, reason?: LogoutReason): Promise<void | SessionInfo>;
    logoutInactiveSessions(filter: (s: SessionInfo) => boolean): void;
}
