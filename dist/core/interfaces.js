"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultErrorMessagesProvider = exports.defaultLogoutReasonsProvider = void 0;

var defaultLogoutReasonsProvider = function defaultLogoutReasonsProvider() {
  return {
    RegularLogout: 'RegularLogout',
    DuplicateLogin: 'DuplicateLogin',
    InactiveExpired: 'Expired in inactive section'
  };
};

exports.defaultLogoutReasonsProvider = defaultLogoutReasonsProvider;

var defaultErrorMessagesProvider = function defaultErrorMessagesProvider() {
  return {
    DuplicateLogin: 'DuplicateLogin',
    OnDuplicateLogin: 'You must call at least one of "logoutExistedOne" or "denyLogin" functions in the "onDuplicateLogin" callback',
    ReloginNotFound: 'Session not found'
  };
};

exports.defaultErrorMessagesProvider = defaultErrorMessagesProvider;