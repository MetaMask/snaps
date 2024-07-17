import {
  deriveEntropy
} from "./chunk-W33UWNA2.mjs";

// src/restricted/manageState.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { ManageStateOperation } from "@metamask/snaps-sdk";
import { STATE_ENCRYPTION_MAGIC_VALUE } from "@metamask/snaps-utils";
import { isObject, getJsonSize } from "@metamask/utils";
var STATE_ENCRYPTION_SALT = "snap_manageState encryption";
var methodName = "snap_manageState";
var specificationBuilder = ({
  allowedCaveats = null,
  methodHooks: methodHooks2
}) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getManageStateImplementation(methodHooks2),
    subjectTypes: [SubjectType.Snap]
  };
};
var methodHooks = {
  getUnlockPromise: true,
  clearSnapState: true,
  getSnapState: true,
  updateSnapState: true
};
var manageStateBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks
});
var STORAGE_SIZE_LIMIT = 104857600;
async function getEncryptionEntropy({
  mnemonicPhrase,
  snapId
}) {
  return await deriveEntropy({
    mnemonicPhrase,
    input: snapId,
    salt: STATE_ENCRYPTION_SALT,
    magic: STATE_ENCRYPTION_MAGIC_VALUE
  });
}
function getManageStateImplementation({
  getUnlockPromise,
  clearSnapState,
  getSnapState,
  updateSnapState
}) {
  return async function manageState(options) {
    const {
      params = {},
      method,
      context: { origin }
    } = options;
    const validatedParams = getValidatedParams(params, method);
    const shouldEncrypt = validatedParams.encrypted ?? true;
    if (shouldEncrypt && validatedParams.operation !== ManageStateOperation.ClearState) {
      await getUnlockPromise(true);
    }
    switch (validatedParams.operation) {
      case ManageStateOperation.ClearState:
        clearSnapState(origin, shouldEncrypt);
        return null;
      case ManageStateOperation.GetState: {
        return await getSnapState(origin, shouldEncrypt);
      }
      case ManageStateOperation.UpdateState: {
        await updateSnapState(origin, validatedParams.newState, shouldEncrypt);
        return null;
      }
      default:
        throw rpcErrors.invalidParams(
          `Invalid ${method} operation: "${validatedParams.operation}"`
        );
    }
  };
}
function getValidatedParams(params, method, storageSizeLimit = STORAGE_SIZE_LIMIT) {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: "Expected params to be a single object."
    });
  }
  const { operation, newState, encrypted } = params;
  if (!operation || typeof operation !== "string" || !Object.values(ManageStateOperation).includes(
    operation
  )) {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid manage state "operation".'
    });
  }
  if (encrypted !== void 0 && typeof encrypted !== "boolean") {
    throw rpcErrors.invalidParams({
      message: '"encrypted" parameter must be a boolean if specified.'
    });
  }
  if (operation === ManageStateOperation.UpdateState) {
    if (!isObject(newState)) {
      throw rpcErrors.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
        data: {
          receivedNewState: typeof newState === "undefined" ? "undefined" : newState
        }
      });
    }
    let size;
    try {
      size = getJsonSize(newState);
    } catch {
      throw rpcErrors.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
        data: {
          receivedNewState: typeof newState === "undefined" ? "undefined" : newState
        }
      });
    }
    if (size > storageSizeLimit) {
      throw rpcErrors.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must not exceed ${storageSizeLimit} bytes in size.`,
        data: {
          receivedNewState: typeof newState === "undefined" ? "undefined" : newState
        }
      });
    }
  }
  return params;
}

export {
  STATE_ENCRYPTION_SALT,
  specificationBuilder,
  manageStateBuilder,
  STORAGE_SIZE_LIMIT,
  getEncryptionEntropy,
  getManageStateImplementation,
  getValidatedParams
};
//# sourceMappingURL=chunk-TE4W25CA.mjs.map