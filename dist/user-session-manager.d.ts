import { DefaultSessionUid, ILoggedInSession, ISessionInfoClass, DefaultUserUid, ILoggedInUser, IUserInfoClass, LogoutReasonsProvider, ErrorMessagesProvider, LogoutReason, DataMergeFunction } from './core/interfaces';
import LoggedInSession from './core/LoggedInSession';
import LoggedInUser from './core/LoggedInUser';
import { OnLoggedInFunction, OnDuplicateLoginFunction, OnUnexpectedLoggedOutFunction, OnReloggedInFunction, OnLoggedOutFunction, OnUserLoggedInFunction, OnUserLoggedOutFunction } from './core/functionTypes';
import { SessionManager } from './session-manager';
export declare class UserSessionManager<SessionUid = DefaultSessionUid, SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>, UserUid = DefaultUserUid, UserInfo extends ILoggedInUser<SessionInfo, UserUid, SessionUid> = LoggedInUser<UserUid, SessionUid, SessionInfo>> {
    SessionInfoClass: ISessionInfoClass;
    UserInfoClass: IUserInfoClass;
    sessionManager: SessionManager<SessionUid, SessionInfo>;
    _userMap: Map<UserUid, UserInfo>;
    onSessionLoggedIn: OnLoggedInFunction<SessionInfo>;
    onSessionDuplicateLogin: OnDuplicateLoginFunction<SessionInfo>;
    onSessionUnexpectedLoggedOut: OnUnexpectedLoggedOutFunction<SessionInfo>;
    onSessionReloggedIn: OnReloggedInFunction<SessionInfo>;
    onSessionLoggedOut: OnLoggedOutFunction<SessionInfo>;
    onUserLoggedIn: OnUserLoggedInFunction<UserInfo>;
    onUserLoggedOut: OnUserLoggedOutFunction<UserInfo>;
    constructor(options: {
        SessionInfoClass?: ISessionInfoClass;
        UserInfoClass?: IUserInfoClass;
        LogoutReasonsProvider?: LogoutReasonsProvider;
        ErrorMessagesProvider?: ErrorMessagesProvider;
        onSessionLoggedIn?: OnLoggedInFunction<SessionInfo>;
        onSessionDuplicateLogin?: OnDuplicateLoginFunction<SessionInfo>;
        onSessionUnexpectedLoggedOut?: OnUnexpectedLoggedOutFunction<SessionInfo>;
        onSessionReloggedIn: OnReloggedInFunction<SessionInfo>;
        onSessionLoggedOut: OnLoggedOutFunction<SessionInfo>;
        onUserLoggedIn: OnUserLoggedInFunction<UserInfo>;
        onUserLoggedOut: OnUserLoggedOutFunction<UserInfo>;
    });
    addUser(userUid: UserUid, user: UserInfo): UserInfo;
    removeUser(userUid: UserUid): void;
    findUser(userUid: UserUid): UserInfo | undefined;
    readonly userMap: Map<UserUid, UserInfo>;
    login(userUid: UserUid, sessionUid: SessionUid, sessionData?: Object): Promise<UserInfo>;
    unexpectedLogout(sessionUid: SessionUid, reason: LogoutReason): Promise<void> | Promise<SessionInfo>;
    relogin(sessionUid: SessionUid, data: {} | undefined, mergeFunc: DataMergeFunction): Promise<SessionInfo>;
    logout(sessionUid: SessionUid, reason: LogoutReason): Promise<void | SessionInfo>;
}
