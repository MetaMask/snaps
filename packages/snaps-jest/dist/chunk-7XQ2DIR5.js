"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkZJJGWZLJjs = require('./chunk-ZJJGWZLJ.js');


var _chunkGLPGOEVEjs = require('./chunk-GLPGOEVE.js');



var _chunk2YE2P5BZjs = require('./chunk-2YE2P5BZ.js');

// src/internals/request.ts


var _snapssdk = require('@metamask/snaps-sdk');
var _snapsutils = require('@metamask/snaps-utils');
var _superstruct = require('@metamask/superstruct');





var _utils = require('@metamask/utils');
var _toolkit = require('@reduxjs/toolkit');
function handleRequest({
  snapId,
  store,
  executionService,
  handler,
  controllerMessenger,
  runSaga,
  request: { id = _toolkit.nanoid.call(void 0, ), origin = "https://metamask.io", ...options }
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
    const notifications = _chunk2YE2P5BZjs.getNotifications.call(void 0, store.getState());
    store.dispatch(_chunk2YE2P5BZjs.clearNotifications.call(void 0, ));
    try {
      const getInterfaceFn = await getInterfaceApi(
        result,
        snapId,
        controllerMessenger
      );
      return {
        id: String(id),
        response: {
          result: _utils.getSafeJson.call(void 0, result)
        },
        notifications,
        ...getInterfaceFn ? { getInterface: getInterfaceFn } : {}
      };
    } catch (error) {
      const [unwrappedError] = _snapsutils.unwrapError.call(void 0, error);
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
    const [unwrappedError] = _snapsutils.unwrapError.call(void 0, error);
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
      _chunkZJJGWZLJjs.getInterface,
      runSaga,
      snapId,
      controllerMessenger
    ).toPromise();
    const result = await Promise.race([promise, sagaPromise]);
    if (_superstruct.is.call(void 0, result, _chunkGLPGOEVEjs.SnapResponseStruct) && _utils.hasProperty.call(void 0, result.response, "error")) {
      throw new Error(
        `Unable to get the interface from the Snap: The returned interface may be invalid. The error message received was: ${result.response.error.message}`
      );
    }
    return await sagaPromise;
  };
  return promise;
}
async function getInterfaceFromResult(result, snapId, controllerMessenger) {
  if (_utils.isPlainObject.call(void 0, result) && _utils.hasProperty.call(void 0, result, "id")) {
    return result.id;
  }
  if (_utils.isPlainObject.call(void 0, result) && _utils.hasProperty.call(void 0, result, "content")) {
    _utils.assert.call(void 0, 
      _superstruct.is.call(void 0, result.content, _snapssdk.ComponentOrElementStruct),
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
      const actions = _chunkZJJGWZLJjs.getInterfaceActions.call(void 0, snapId, controllerMessenger, {
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





exports.handleRequest = handleRequest; exports.getInterfaceFromResult = getInterfaceFromResult; exports.getInterfaceApi = getInterfaceApi;
//# sourceMappingURL=chunk-7XQ2DIR5.js.map