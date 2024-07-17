import {
  getInterface,
  getInterfaceActions
} from "./chunk-AE7BNNEK.mjs";
import {
  SnapResponseStruct
} from "./chunk-C26TYXXD.mjs";
import {
  clearNotifications,
  getNotifications
} from "./chunk-LB4R3BUA.mjs";

// src/internals/request.ts
import {
  ComponentOrElementStruct
} from "@metamask/snaps-sdk";
import { unwrapError } from "@metamask/snaps-utils";
import { is } from "@metamask/superstruct";
import {
  assert,
  getSafeJson,
  hasProperty,
  isPlainObject
} from "@metamask/utils";
import { nanoid } from "@reduxjs/toolkit";
function handleRequest({
  snapId,
  store,
  executionService,
  handler,
  controllerMessenger,
  runSaga,
  request: { id = nanoid(), origin = "https://metamask.io", ...options }
}) {
  const getInterfaceError = () => {
    throw new Error(
      "Unable to get the interface from the Snap: The request to the Snap failed."
    );
  };
  const promise = executionService.handleRpcRequest(snapId, {
    origin,
    handler,
    request: {
      jsonrpc: "2.0",
      id: 1,
      ...options
    }
  }).then(async (result) => {
    const notifications = getNotifications(store.getState());
    store.dispatch(clearNotifications());
    try {
      const getInterfaceFn = await getInterfaceApi(
        result,
        snapId,
        controllerMessenger
      );
      return {
        id: String(id),
        response: {
          result: getSafeJson(result)
        },
        notifications,
        ...getInterfaceFn ? { getInterface: getInterfaceFn } : {}
      };
    } catch (error) {
      const [unwrappedError] = unwrapError(error);
      return {
        id: String(id),
        response: {
          error: unwrappedError.serialize()
        },
        notifications: [],
        getInterface: getInterfaceError
      };
    }
  }).catch((error) => {
    const [unwrappedError] = unwrapError(error);
    return {
      id: String(id),
      response: {
        error: unwrappedError.serialize()
      },
      notifications: [],
      getInterface: getInterfaceError
    };
  });
  promise.getInterface = async () => {
    const sagaPromise = runSaga(
      getInterface,
      runSaga,
      snapId,
      controllerMessenger
    ).toPromise();
    const result = await Promise.race([promise, sagaPromise]);
    if (is(result, SnapResponseStruct) && hasProperty(result.response, "error")) {
      throw new Error(
        `Unable to get the interface from the Snap: The returned interface may be invalid. The error message received was: ${result.response.error.message}`
      );
    }
    return await sagaPromise;
  };
  return promise;
}
async function getInterfaceFromResult(result, snapId, controllerMessenger) {
  if (isPlainObject(result) && hasProperty(result, "id")) {
    return result.id;
  }
  if (isPlainObject(result) && hasProperty(result, "content")) {
    assert(
      is(result.content, ComponentOrElementStruct),
      "The Snap returned an invalid interface."
    );
    const id = await controllerMessenger.call(
      "SnapInterfaceController:createInterface",
      snapId,
      result.content
    );
    return id;
  }
  return void 0;
}
async function getInterfaceApi(result, snapId, controllerMessenger) {
  const interfaceId = await getInterfaceFromResult(
    result,
    snapId,
    controllerMessenger
  );
  if (interfaceId) {
    return () => {
      const { content } = controllerMessenger.call(
        "SnapInterfaceController:getInterface",
        snapId,
        interfaceId
      );
      const actions = getInterfaceActions(snapId, controllerMessenger, {
        id: interfaceId,
        content
      });
      return {
        content,
        ...actions
      };
    };
  }
  return void 0;
}

export {
  handleRequest,
  getInterfaceFromResult,
  getInterfaceApi
};
//# sourceMappingURL=chunk-5WI4ASGG.mjs.map