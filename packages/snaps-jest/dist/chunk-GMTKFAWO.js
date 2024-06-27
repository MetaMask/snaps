"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk2YE2P5BZjs = require('./chunk-2YE2P5BZ.js');

// src/internals/simulation/methods/hooks/notifications.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _toolkit = require('@reduxjs/toolkit');
var _effects = require('redux-saga/effects');
function* showNativeNotificationImplementation(_snapId, { message }) {
  yield _effects.put.call(void 0, 
    _chunk2YE2P5BZjs.addNotification.call(void 0, { id: _toolkit.nanoid.call(void 0, ), type: _snapssdk.NotificationType.Native, message })
  );
  return null;
}
function getShowNativeNotificationImplementation(runSaga) {
  return async (...args) => {
    return await runSaga(
      showNativeNotificationImplementation,
      ...args
    ).toPromise();
  };
}
function* showInAppNotificationImplementation(_snapId, { message }) {
  yield _effects.put.call(void 0, 
    _chunk2YE2P5BZjs.addNotification.call(void 0, { id: _toolkit.nanoid.call(void 0, ), type: _snapssdk.NotificationType.InApp, message })
  );
  return null;
}
function getShowInAppNotificationImplementation(runSaga) {
  return async (...args) => {
    return await runSaga(
      showInAppNotificationImplementation,
      ...args
    ).toPromise();
  };
}




exports.getShowNativeNotificationImplementation = getShowNativeNotificationImplementation; exports.getShowInAppNotificationImplementation = getShowInAppNotificationImplementation;
//# sourceMappingURL=chunk-GMTKFAWO.js.map