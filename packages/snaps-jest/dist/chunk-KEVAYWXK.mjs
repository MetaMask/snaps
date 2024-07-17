import {
  createJsonRpcEngine
} from "./chunk-KNJNL723.mjs";
import {
  resolveWithSaga
} from "./chunk-AE7BNNEK.mjs";
import {
  getSnapFile
} from "./chunk-IWJ4HKDR.mjs";
import {
  getOptions
} from "./chunk-SHABXXTB.mjs";
import {
  getControllers,
  registerSnap
} from "./chunk-ZW6THUUV.mjs";
import {
  getEndowments
} from "./chunk-OSAKGO27.mjs";
import {
  createStore
} from "./chunk-EZNLDMH4.mjs";
import {
  getCurrentInterface
} from "./chunk-ZJQSGRNK.mjs";

// src/internals/simulation/simulation.ts
import { ControllerMessenger } from "@metamask/base-controller";
import { createEngineStream } from "@metamask/json-rpc-middleware-stream";
import { mnemonicPhraseToBytes } from "@metamask/key-tree";
import {
  fetchSnap,
  detectSnapLocation,
  NodeThreadExecutionService,
  setupMultiplex
} from "@metamask/snaps-controllers/node";
import { DIALOG_APPROVAL_TYPES } from "@metamask/snaps-rpc-methods";
import { logError } from "@metamask/snaps-utils";
import { pipeline } from "readable-stream";
import { select } from "redux-saga/effects";
async function handleInstallSnap(snapId, {
  executionService,
  executionServiceOptions,
  options: rawOptions = {}
} = {}) {
  const options = getOptions(rawOptions);
  const location = detectSnapLocation(snapId, {
    allowLocal: true
  });
  const snapFiles = await fetchSnap(snapId, location);
  const { store, runSaga } = createStore(options);
  const controllerMessenger = new ControllerMessenger();
  registerActions(controllerMessenger, runSaga);
  const hooks = getHooks(options, snapFiles, snapId, controllerMessenger);
  const { subjectMetadataController, permissionController } = getControllers({
    controllerMessenger,
    hooks,
    runSaga,
    options
  });
  const engine = createJsonRpcEngine({
    store,
    hooks,
    permissionMiddleware: permissionController.createPermissionMiddleware({
      origin: snapId
    })
  });
  const ExecutionService = executionService ?? NodeThreadExecutionService;
  const service = new ExecutionService({
    ...executionServiceOptions,
    messenger: controllerMessenger.getRestricted({
      name: "ExecutionService",
      allowedActions: [],
      allowedEvents: []
    }),
    setupSnapProvider: (_snapId, rpcStream) => {
      const mux = setupMultiplex(rpcStream, "snapStream");
      const stream = mux.createStream("metamask-provider");
      const providerStream = createEngineStream({ engine });
      pipeline(stream, providerStream, stream, (error) => {
        if (error) {
          logError(`Provider stream failure.`, error);
        }
      });
    }
  });
  await registerSnap(snapId, snapFiles.manifest.result, {
    permissionController,
    subjectMetadataController
  });
  await service.executeSnap({
    snapId,
    sourceCode: snapFiles.sourceCode.toString("utf8"),
    endowments: await getEndowments(permissionController, snapId)
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
    getMnemonic: async () => Promise.resolve(mnemonicPhraseToBytes(options.secretRecoveryPhrase)),
    getSnapFile: async (path, encoding) => await getSnapFile(snapFiles.auxiliaryFiles, path, encoding),
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
        const currentInterface2 = yield select(getCurrentInterface);
        return currentInterface2;
      }
      const currentInterface = runSaga(
        getCurrentInterfaceSaga
      ).result();
      return currentInterface?.type === DIALOG_APPROVAL_TYPES.default && currentInterface?.id === opts?.id;
    }
  );
  controllerMessenger.registerActionHandler(
    "ApprovalController:acceptRequest",
    async (_id, value) => {
      await runSaga(resolveWithSaga, value).toPromise();
      return { value };
    }
  );
}

export {
  handleInstallSnap,
  getHooks,
  registerActions
};
//# sourceMappingURL=chunk-KEVAYWXK.mjs.map