/* eslint-disable no-underscore-dangle, no-param-reassign */
import {
  DefaultSessionUid,
  ILoggedInSession,
} from './interfaces';

import LoggedInSession from './LoggedInSession';

export default class ActivityMap<
  SessionUid = DefaultSessionUid,
  SessionInfo extends ILoggedInSession<SessionUid> = LoggedInSession<SessionUid>
> {
  _map : Map<SessionUid, SessionInfo>;
  _inactiveMap : Map<SessionUid, SessionInfo>;

  constructor() {
    this._map = new Map<SessionUid, SessionInfo>();
    this._inactiveMap = new Map<SessionUid, SessionInfo>();
  }

  // without checking duplicate key
  add(key : SessionUid, value : SessionInfo) {
    this._map.set(key, value);
  }

  // without checking duplicate key
  moveToInactive(
    key : SessionUid,
    modifyFunc : (s: SessionInfo) => SessionInfo = ((value : SessionInfo) => value),
  ) {
    const value = this.find(key);
    if (!value) {
      return value;
    }
    this._map.delete(key);
    const newValue = modifyFunc(value);
    this._inactiveMap.set(key, newValue);
    return newValue;
  }

  // without checking duplicate key
  moveToActive(
    key : SessionUid,
    modifyFunc : (s: SessionInfo) => SessionInfo = ((value : SessionInfo) => value),
  ) {
    const value = this.findInInactive(key);
    if (!value) {
      return value;
    }
    this._inactiveMap.delete(key);
    const newValue = modifyFunc(value);
    this._map.set(key, newValue);
    return newValue;
  }

  removeFromInactive(key : SessionUid) {
    const value = this.findInInactive(key);
    if (!value) {
      return value;
    }
    this._inactiveMap.delete(key);
    return value;
  }

  remove(key : SessionUid, includingInactive = false) {
    const value = this.find(key);
    if (!value) {
      return (includingInactive && this.removeFromInactive(key)) || value;
    }
    this._map.delete(key);
    return value;
  }

  findInInactive(key : SessionUid) {
    return this._inactiveMap.get(key);
  }

  find(key : SessionUid, includingInactive = false) : SessionInfo | void {
    return this._map.get(key) || (includingInactive ? this.findInInactive(key) : undefined);
  }

  hasInInactive(key : SessionUid) {
    return !!this.findInInactive(key);
  }

  has(key : SessionUid, includingInactive = false) {
    return !!this.find(key, includingInactive);
  }

  getState(key : SessionUid) {
    if (this.has(key)) {
      return 'active';
    }
    if (this.hasInInactive(key)) {
      return 'inactive';
    }
    return null;
  }

  get activeMap() {
    return this._map;
  }

  get inactiveMap() {
    return this._inactiveMap;
  }
}
