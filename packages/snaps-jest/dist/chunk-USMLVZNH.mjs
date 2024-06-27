import {
  closeInterface,
  resolveInterface,
  setInterface
} from "./chunk-JBCVYYCS.mjs";

// src/internals/simulation/methods/hooks/request-user-approval.ts
import { put, take } from "redux-saga/effects";
function* requestUserApprovalImplementation({
  type,
  requestData: { id }
}) {
  yield put(setInterface({ type, id }));
  const { payload } = yield take(resolveInterface.type);
  yield put(closeInterface());
  return payload;
}
function getRequestUserApprovalImplementation(runSaga) {
  return async (...args) => {
    return await runSaga(
      requestUserApprovalImplementation,
      ...args
    ).toPromise();
  };
}

export {
  getRequestUserApprovalImplementation
};
//# sourceMappingURL=chunk-USMLVZNH.mjs.map