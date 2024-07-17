"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkXWGECIXIjs = require('./chunk-XWGECIXI.js');


var _chunkZJJGWZLJjs = require('./chunk-ZJJGWZLJ.js');


var _chunkSW65QYFVjs = require('./chunk-SW65QYFV.js');


var _chunkHIVPOOGKjs = require('./chunk-HIVPOOGK.js');



var _chunkBCZYDPJAjs = require('./chunk-BCZYDPJA.js');


var _chunkBMGHZPDFjs = require('./chunk-BMGHZPDF.js');


var _chunkALE5GAX6js = require('./chunk-ALE5GAX6.js');


var _chunkD653LBAYjs = require('./chunk-D653LBAY.js');

// src/internals/simulation/simulation.ts
var _basecontroller = require('@metamask/base-controller');
var _jsonrpcmiddlewarestream = require('@metamask/json-rpc-middleware-stream');
var _keytree = require('@metamask/key-tree');





var _node = require('@metamask/snaps-controllers/node');
var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var _snapsutils = require('@metamask/snaps-utils');
var _readablestream = require('readable-stream');
var _effects = require('redux-saga/effects');
async function handleInstallSnap(snapId, {
  executionService,
  executionServiceOptions,
  options: rawOptions = {}
} = {}) {
  const options = _chunkHIVPOOGKjs.getOptions.call(void 0, rawOptions);
  const location = _node.detectSnapLocation.call(void 0, snapId, {
    allowLocal: true
  });
  const snapFiles = await _node.fetchSnap.call(void 0, snapId, location);
  const { store, runSaga } = _chunkALE5GAX6js.createStore.call(void 0, options);
  const controllerMessenger = new (0, _basecontroller.ControllerMessenger)();
  registerActions(controllerMessenger, runSaga);
  const hooks = getHooks(options, snapFiles, snapId, controllerMessenger);
  const { subjectMetadataController, permissionController } = _chunkBCZYDPJAjs.getControllers.call(void 0, {
    controllerMessenger,
    hooks,
    runSaga,
    options
  });
  const engine = _chunkXWGECIXIjs.createJsonRpcEngine.call(void 0, {
    store,
    hooks,
    permissionMiddleware: permissionController.createPermissionMiddleware({
      origin: snapId
    })
  });
  const ExecutionService = executionService ?? _node.NodeThreadExecutionService;
  const service = new ExecutionService({
    ...executionServiceOptions,
    messenger: controllerMessenger.getRestricted({
      name: "ExecutionService",
      allowedActions: [],
      allowedEvents: []
    }),
    setupSnapProvider: (_snapId, rpcStream) => {
      const mux = _node.setupMultiplex.call(void 0, rpcStream, "snapStream");
      const stream = mux.createStream("metamask-provider");
      const providerStream = _jsonrpcmiddlewarestream.createEngineStream.call(void 0, { engine });
      _readablestream.pipeline.call(void 0, stream, providerStream, stream, (error) => {
        if (error) {
          _snapsutils.logError.call(void 0, `Provider stream failure.`, error);
        }
      });
    }
  });
  await _chunkBCZYDPJAjs.registerSnap.call(void 0, snapId, snapFiles.manifest.result, {
    permissionController,
    subjectMetadataController
  });
  await service.executeSnap({
    snapId,
    sourceCode: snapFiles.sourceCode.toString("utf8"),
    endowments: await _chunkBMGHZPDFjs.getEndowments.call(void 0, permissionController, snapId)
  });
  return {
    snapId,
    store,
    executionService: service,
    controllerMessenger,
    runSaga
  };
}
function getHooks(options, snapFiles, snapId, controllerMessenger) {
  return {
    getMnemonic: async () => Promise.resolve(_keytree.mnemonicPhraseToBytes.call(void 0, options.secretRecoveryPhrase)),
    getSnapFile: async (path, encoding) => await _chunkSW65QYFVjs.getSnapFile.call(void 0, snapFiles.auxiliaryFiles, path, encoding),
    getIsLocked: () => false,
    createInterface: async (...args) => controllerMessenger.call(
      "SnapInterfaceController:createInterface",
      snapId,
      ...args
    ),
    updateInterface: async (...args) => controllerMessenger.call(
      "SnapInterfaceController:updateInterface",
      snapId,
      ...args
    ),
    getInterfaceState: (...args) => controllerMessenger.call(
      "SnapInterfaceController:getInterface",
      snapId,
      ...args
    ).state,
    resolveInterface: async (...args) => controllerMessenger.call(
      "SnapInterfaceController:resolveInterface",
      snapId,
      ...args
    )
  };
}
function registerActions(controllerMessenger, runSaga) {
  controllerMessenger.registerActionHandler(
    "PhishingController:maybeUpdateState",
    async () => Promise.resolve()
  );
  controllerMessenger.registerActionHandler(
    "PhishingController:testOrigin",
    () => ({ result: false, type: "all" })
  );
  controllerMessenger.registerActionHandler(
    "ApprovalController:hasRequest",
    (opts) => {
      function* getCurrentInterfaceSaga() {
        const currentInterface2 = yield _effects.select.call(void 0, _chunkD653LBAYjs.getCurrentInterface);
        return currentInterface2;
      }
      const currentInterface = runSaga(
        getCurrentInterfaceSaga
      ).result();
      return currentInterface?.type === _snapsrpcmethods.DIALOG_APPROVAL_TYPES.default && currentInterface?.id === opts?.id;
    }
  );
  controllerMessenger.registerActionHandler(
    "ApprovalController:acceptRequest",
    async (_id, value) => {
      await runSaga(_chunkZJJGWZLJjs.resolveWithSaga, value).toPromise();
      return { value };
    }
  );
}





exports.handleInstallSnap = handleInstallSnap; exports.getHooks = getHooks; exports.registerActions = registerActions;
//# sourceMappingURL=chunk-FX4D4J6Y.js.map