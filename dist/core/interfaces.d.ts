export declare type ValidKey = string | number | Symbol;
export declare type DefaultSessionUid = ValidKey;
export interface LoggedInSessionConfig<SessionUid = DefaultSessionUid> {
    uid: SessionUid;
    data?: Object;
    updatedTime?: number;
    active?: boolean;
    [index: string]: any;
    [index: number]: any;
}
export interface ILoggedInSession<SessionUid = DefaultSessionUid> {
    uid: SessionUid;
    data: Object;
    updatedTime: number;
    active: boolean;
    [index: string]: any;
    [index: number]: any;
}
export interface ISessionInfoClass {
    new <SessionUid>(...args: any[]): ILoggedInSession<SessionUid>;
}
export declare type DefaultUserUid = DefaultSessionUid;
export interface LoggedInUserConfig<UserUid = DefaultUserUid> {
    uid: UserUid;
    data?: Object;
    [index: string]: any;
    [index: number]: any;
}
export interface ILoggedInUser<SessionInfo, UserUid = DefaultUserUid, SessionUid = DefaultSessionUid> {
    uid: UserUid;
    data: Object;
    sessionMap: Map<SessionUid, SessionInfo>;
    [index: string]: any;
    [index: number]: any;
}
export interface IUserInfoClass {
    new <UserUid, SessionUid, SessionInfo>(...args: any[]): ILoggedInUser<SessionInfo, UserUid, SessionUid>;
}
export declare type DataMergeFunction = (obj1: Object, obj2: Object) => Object;
export declare type LogoutReason = string;
export interface ILogoutReasons {
    RegularLogout: LogoutReason;
    DuplicateLogin: LogoutReason;
    InactiveExpired: LogoutReason;
}
export declare type LogoutReasonsProvider = () => ILogoutReasons;
export declare type ErrorMessage = string;
export interface IErrorMessages {
    DuplicateLogin: ErrorMessage;
    OnDuplicateLogin: ErrorMessage;
    ReloginNotFound: ErrorMessage;
}
export declare type ErrorMessagesProvider = () => IErrorMessages;
export declare const defaultLogoutReasonsProvider: () => {
    RegularLogout: string;
    DuplicateLogin: string;
    InactiveExpired: string;
};
export declare const defaultErrorMessagesProvider: () => {
    DuplicateLogin: string;
    OnDuplicateLogin: string;
    ReloginNotFound: string;
};
