/*eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';
import {
  LoggedInSession,
  SessionManager,
} from '../../dist/session-manager';


let expect = chai.expect;
let assert = chai.assert;

describe('Linked list test', () => {
  describe('Basic', () => {
    let loginType01 = (sessionMgr, uid) => {
      return sessionMgr.login(uid, {
        connectUid: 'hi',
      });
    };

    let verifyUserType01 = (newSession, uid) => {
      expect(newSession, 'newSession').to.be.an('object');
      expect(newSession.uid, 'newSession.uid').to.equal(uid);
      expect(newSession.data, 'newSession.data').to.be.an('object');
      expect(newSession.data.connectUid, 'newSession.data.connectUid').to.exist;
      expect(newSession.data.connectUid, 'newSession.data.connectUid').to.equal('hi');
      return newSession;
    };

    it('should able to login with Promise interface', () => {
      let sessionMgr = new SessionManager({});

      return loginType01(sessionMgr, 1)
      .then(newSession => verifyUserType01(newSession, 1));
    });

    it('should able to trigger "onLoggedIn" event', () => {
      let loggedInEventTriggered = false;
      let sessionMgr = new SessionManager({
        onLoggedIn: (newSession => {
          loggedInEventTriggered = true;
          verifyUserType01(newSession, 1);
        }),
      });

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        expect(newSession, 'newSession').to.be.an('object');
        expect(loggedInEventTriggered, 'loggedInEventTriggered').to.equal(true);
        return newSession;
      });
    });

    it('should able to logout with Promise interface', () => {
      let sessionMgr = new SessionManager({});

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        return sessionMgr.logout(1);
      })
      .then(newSession => verifyUserType01(newSession, 1));
    });

    it('should able to trigger "onLoggedOut" event', () => {
      let loggedOutEventTriggered = false;
      let sessionMgr = new SessionManager({
        onLoggedOut: ((existedSession, reason) => {
          loggedOutEventTriggered = true;
          //expect(reason, 'reason').to.be.an.instanceof(SessionManager.LogoutReason.RegularLogout);
          expect(reason, 'reason').to.equal(SessionManager.LogoutReason.RegularLogout);
          verifyUserType01(existedSession, 1);
        }),
      });

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        return sessionMgr.logout(1);
      })
      .then(existedSession => {
        expect(existedSession, 'existedSession').to.be.an('object');
        expect(loggedOutEventTriggered, 'loggedOutEventTriggered').to.equal(true);
        return existedSession;
      });
    });

    it('should able to trigger "onUnexpectedLoggedOut" event', () => {
      let unexpectedLoggedOutTriggered = false;
      let sessionMgr = new SessionManager({
        onUnexpectedLoggedOut: ((existedSession, reason) => {
          unexpectedLoggedOutTriggered = true;
          expect(reason, 'reason').to.equal('ConnectionLost');
          verifyUserType01(existedSession, 1);
        }),
      });

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        return sessionMgr.unexpectedLogout(1, 'ConnectionLost');
      })
      .then(existedSession => {
        expect(sessionMgr.inactiveSessions[1], 'sessionMgr.inactiveSessions[1]').to.exist;
        expect(existedSession, 'existedSession').to.be.an('object');
        expect(unexpectedLoggedOutTriggered, 'unexpectedLoggedOutTriggered').to.equal(true);
        return existedSession;
      });
    });

    it('should able to trigger "onReloggedIn" event', () => {
      let reloggedInTriggered = false;
      let sessionMgr = new SessionManager({
        onReloggedIn: ((reloggedInSession, newData) => {
          reloggedInTriggered = true;
          verifyUserType01(reloggedInSession, 1);
        }),
      });

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        return sessionMgr.unexpectedLogout(1, 'ConnectionLost');
      })
      .then(newSession => {
        return sessionMgr.relogin(1, {});
      })
      .then(reloggedInSession => {
        expect(reloggedInSession, 'reloggedInSession').to.be.an('object');
        expect(reloggedInTriggered, 'reloggedInTriggered').to.equal(true);
        return reloggedInSession;
      });
    });

    it('should able to trigger "onDuplicateLogin" event', () => {
      let duplicateLoginEventTriggered = false;
      let sessionMgr = new SessionManager({
        onDuplicateLogin: ((existedSession, newSession, logoutExistedOne, denyLogin) => {
          duplicateLoginEventTriggered = true;
          expect(typeof logoutExistedOne, 'typeof logoutExistedOne').to.equals('function');
          expect(typeof denyLogin, 'typeof denyLogin').to.equals('function');

          verifyUserType01(existedSession, 1);
          verifyUserType01(newSession, 1);

          denyLogin();
          logoutExistedOne();
        }),
      });

      return loginType01(sessionMgr, 1)
      .then(newSession => {
        return loginType01(sessionMgr, 1);
      })
      .then(newSession => {
        throw Error('Passed');
      })
      .catch(error => {
        expect(error.message, 'error.message').to.equal(SessionManager.ErrorMessage.DuplicateLogin);
        expect(duplicateLoginEventTriggered, 'duplicateLoginEventTriggered').to.equal(true);
        return error;
      });
    });

    // it('should able to login with Promise interface', () => {
    //   let sessionMgr = new SessionManager({
    //     SessionInfoClass: LoggedInSession,
    //     onDuplicateLogin: ((existedSession, newSession, logoutExistedOne, denyLogin) => {
    //       if(existedSession.data.connectUid === newSession.data.connectUid){
    //         console.log(' =======> Deny');
    //         denyLogin();
    //       }else{
    //         console.log(' =======> Kick');
    //         logoutExistedOne();
    //       }
    //     }),
    //     onLoggedIn: (session => {
    //       console.log(' ==> onLoggedIn :', session.uid);
    //     }),
    //     onUnexpectedLoggedOut: ((session, reason) => {
    //       // session.getWs().close();
    //       console.log(' ==> onUnexpectedLoggedOut :', session.uid);
    //     }),
    //     onReloggedIn: ((session, newData) => {
    //       console.log(' ==> onReloggedIn :', session.uid);
    //     }),
    //     onLoggedOut: ((session, reason) => {
    //       // session.getWs().close();
    //       console.log(' ==> onLoggedOut :', session.uid);
    //     }),
    //   });

    //   return sessionMgr.login(1, {
    //     connectUid: 'hi',
    //   })
    //   .then(newSession => {
    //     console.log('newSession :', newSession);
    //     // return Promise.resolve(newSession);
    //     return sessionMgr.login(1, {
    //       connectUid: 'hi',
    //     });
    //   })
    //   .catch(err => {
    //     if(err === SessionManager.ErrorMessage.DuplicateLogin){
    //       //lMsg.response.send({error: SessionManager.ErrorMessage.DuplicateLogin});
    //     }else{
    //       //lMsg.response.send({error: 'Unexpected login failure.'});
    //     }
    //     return Promise.reject(err);
    //   });
    // });
  });
});

