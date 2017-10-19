/*eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';
import {
  UserSessionManager,
} from '../../dist/user-session-manager';


let expect = chai.expect;
let assert = chai.assert;

describe('Linked list test', () => {
  describe('Basic', () => {
    let loginType01 = (userSessionMgr, uid, session) => {
      return userSessionMgr.login(uid, session, {
        connectUid: 'hi',
      });
    };

    let verifySessionType01 = (session) => {
      expect(session, 'session').to.exist;
      expect(session.data, 'session.data').to.exist;
      expect(session.data.connectUid, 'session.data.connectUid').to.exist;
      expect(session.data.connectUid, 'session.data.connectUid').to.equal('hi');
      return session;
    };

    let verifyUserType01 = (newUser, uid, session) => {
      expect(newUser, 'newUser').to.be.an('object');
      expect(newUser.uid, 'newUser.uid').to.equal(uid);
      expect(newUser.data, 'newUser.data').to.be.an('object');
      expect(newUser.sessions, 'newUser.sessions').to.be.an('object');
      verifySessionType01(newUser.sessions[session]);
      return newUser;
    };

    it('should able to login with Promise interface', () => {
      let userSessionMgr = new UserSessionManager({});

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => verifyUserType01(newUser, 1, 'session1'));
    });

    it('should able to trigger "onUserLoggedIn" and "onSessionLoggedIn" event', () => {
      let userLoggedInEventTriggered = false;
      let sessionLoggedInEventTriggered = false;
      let userSessionMgr = new UserSessionManager({
        onUserLoggedIn: (newUser => {
          userLoggedInEventTriggered = true;
          verifyUserType01(newUser, 1, 'session1');
        }),
        onSessionLoggedIn: (newSession => {
          sessionLoggedInEventTriggered = true;
          verifySessionType01(newSession);
        }),
      });

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        expect(userLoggedInEventTriggered, 'userLoggedInEventTriggered').to.equal(true);
        expect(sessionLoggedInEventTriggered, 'sessionLoggedInEventTriggered').to.equal(true);
        return newUser;
      });
    });

    it('should able to logout with Promise interface', () => {
      let userSessionMgr = new UserSessionManager({});
      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        return userSessionMgr.logout('session1');
      })
      .then(newSession => verifySessionType01(newSession));
    });

    it('should able to trigger "onUserLoggedOut" and "onSessionLoggedOut" event', () => {
      let userLoggedOutEventTriggered = false;
      let sessionLoggedOutEventTriggered = false;
      let userSessionMgr = new UserSessionManager({
        onUserLoggedOut: (existedUser => {
          userLoggedOutEventTriggered = true;
        }),
        onSessionLoggedOut: ((existedSession, reason) => {
          sessionLoggedOutEventTriggered = true;
          expect(reason, 'reason').to.equal(UserSessionManager.LogoutReason.RegularLogout);
          verifySessionType01(existedSession);
        }),
      });

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        return userSessionMgr.logout('session1');
      })
      .then(existedSession => {
        expect(existedSession, 'existedSession').to.be.an('object');
        expect(userLoggedOutEventTriggered, 'userLoggedOutEventTriggered').to.equal(true);
        expect(sessionLoggedOutEventTriggered, 'sessionLoggedOutEventTriggered').to.equal(true);
        return existedSession;
      });
    });

    it('should able to trigger "onSessionUnexpectedLoggedOut" event', () => {
      let sessionUnexpectedLoggedOutTriggered = false;
      let userSessionMgr = new UserSessionManager({
        onSessionUnexpectedLoggedOut: ((existedSession, reason) => {
          sessionUnexpectedLoggedOutTriggered = true;
          expect(reason, 'reason').to.equal('ConnectionLost');
          verifySessionType01(existedSession);
        }),
      });

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        return userSessionMgr.unexpectedLogout('session1', 'ConnectionLost');
      })
      .then(existedSession => {
        expect(userSessionMgr.sessionManager.inactiveSessions['session1'], 'userSessionMgr.sessionManager.inactiveSessions["session1"]').to.exist;
        expect(existedSession, 'existedSession').to.be.an('object');
        expect(sessionUnexpectedLoggedOutTriggered, 'sessionUnexpectedLoggedOutTriggered').to.equal(true);
        return existedSession;
      });
    });

    it('should able to trigger "onSessionReloggedIn" event', () => {
      let sessionReloggedInTriggered = false;
      let userSessionMgr = new UserSessionManager({
        onSessionReloggedIn: ((reloggedInSession, newData) => {
          sessionReloggedInTriggered = true;
          verifySessionType01(reloggedInSession);
        }),
      });

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        return userSessionMgr.unexpectedLogout('session1', 'ConnectionLost');
      })
      .then(existedSession => {
        return userSessionMgr.relogin('session1', {});
      })
      .then(reloggedInSession => {
        expect(reloggedInSession, 'reloggedInSession').to.be.an('object');
        expect(sessionReloggedInTriggered, 'sessionReloggedInTriggered').to.equal(true);
        return reloggedInSession;
      });
    });

    it('should able to trigger "onSessionDuplicateLogin" event', () => {
      let sessionDuplicateLoginEventTriggered = false;
      let userSessionMgr = new UserSessionManager({
        onSessionDuplicateLogin: ((existedSession, newSession, logoutExistedOne, denyLogin) => {
          sessionDuplicateLoginEventTriggered = true;
          expect(typeof logoutExistedOne, 'typeof logoutExistedOne').to.equals('function');
          expect(typeof denyLogin, 'typeof denyLogin').to.equals('function');

          verifySessionType01(existedSession, 1);
          verifySessionType01(newSession, 1);

          denyLogin();
          logoutExistedOne();
        }),
      });

      return loginType01(userSessionMgr, 1, 'session1')
      .then(newUser => {
        return loginType01(userSessionMgr, 1, 'session1');
      })
      .then(newUser => {
        throw Error('Passed');
      })
      .catch(error => {
        expect(error.message, 'error.message').to.equal(UserSessionManager.ErrorMessage.DuplicateLogin);
        expect(sessionDuplicateLoginEventTriggered, 'sessionDuplicateLoginEventTriggered').to.equal(true);
        return error;
      });
    });

  });
});

