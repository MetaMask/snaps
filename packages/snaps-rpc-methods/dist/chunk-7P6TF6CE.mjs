import {
  invokeKeyringHandler
} from "./chunk-2L2ATCIK.mjs";
import {
  invokeSnapSugarHandler
} from "./chunk-2CTOCP34.mjs";
import {
  requestSnapsHandler
} from "./chunk-MXPVC2XP.mjs";
import {
  resolveInterfaceHandler
} from "./chunk-MC2Z4NF6.mjs";
import {
  updateInterfaceHandler
} from "./chunk-UY4DUF53.mjs";
import {
  createInterfaceHandler
} from "./chunk-XGMYBPQR.mjs";
import {
  getAllSnapsHandler
} from "./chunk-UB3733UY.mjs";
import {
  getClientStatusHandler
} from "./chunk-62URQ5VS.mjs";
import {
  getFileHandler
} from "./chunk-GPV4ETUH.mjs";
import {
  getInterfaceStateHandler
} from "./chunk-TVC3E5LI.mjs";
import {
  getSnapsHandler
} from "./chunk-CH5O2YCX.mjs";

// src/permitted/handlers.ts
var methodHandlers = {
  wallet_getAllSnaps: getAllSnapsHandler,
  wallet_getSnaps: getSnapsHandler,
  wallet_requestSnaps: requestSnapsHandler,
  wallet_invokeSnap: invokeSnapSugarHandler,
  wallet_invokeKeyring: invokeKeyringHandler,
  snap_getClientStatus: getClientStatusHandler,
  snap_getFile: getFileHandler,
  snap_createInterface: createInterfaceHandler,
  snap_updateInterface: updateInterfaceHandler,
  snap_getInterfaceState: getInterfaceStateHandler,
  snap_resolveInterface: resolveInterfaceHandler
};
var handlers = Object.values(methodHandlers);

export {
  methodHandlers,
  handlers
};
//# sourceMappingURL=chunk-7P6TF6CE.mjs.map