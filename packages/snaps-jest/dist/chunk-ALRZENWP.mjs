import {
  addNotification
} from "./chunk-LB4R3BUA.mjs";

// src/internals/simulation/methods/hooks/notifications.ts
import { NotificationType } from "@metamask/snaps-sdk";
import { nanoid } from "@reduxjs/toolkit";
import { put } from "redux-saga/effects";
function* showNativeNotificationImplementation(_snapId, { message }) {
  yield put(
    addNotification({ id: nanoid(), type: NotificationType.Native, message })
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
  yield put(
    addNotification({ id: nanoid(), type: NotificationType.InApp, message })
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

export {
  getShowNativeNotificationImplementation,
  getShowInAppNotificationImplementation
};
//# sourceMappingURL=chunk-ALRZENWP.mjs.map