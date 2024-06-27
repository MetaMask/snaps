import {
  getOptions
} from "./chunk-KOPPL55J.mjs";
import {
  handleInstallSnap
} from "./chunk-WO346H6V.mjs";
import {
  startServer
} from "./chunk-SLU4FNKX.mjs";
import {
  rootLogger
} from "./chunk-J4ZPUCLX.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-JMDSN227.mjs";

// src/environment.ts
import { assert, createModuleLogger } from "@metamask/utils";
import NodeEnvironment from "jest-environment-node";
var log = createModuleLogger(rootLogger, "environment");
var _options, _server, _instance;
var SnapsEnvironment = class extends NodeEnvironment {
  /**
   * Constructor.
   *
   * @param options - The environment options.
   * @param context - The environment context.
   */
  constructor(options, context) {
    super(options, context);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _server, void 0);
    __privateAdd(this, _instance, void 0);
    __privateSet(this, _options, getOptions(options.projectConfig.testEnvironmentOptions));
  }
  /**
   * Set up the environment. This starts the built-in HTTP server, and creates a
   * new browser instance.
   */
  async setup() {
    await super.setup();
    if (__privateGet(this, _options).server.enabled) {
      log("Starting server.");
      __privateSet(this, _server, await startServer(__privateGet(this, _options).server));
    }
    this.global.snapsEnvironment = this;
  }
  /**
   * Tear down the environment. This closes the browser, and stops the built-in
   * HTTP server.
   */
  async teardown() {
    await __privateGet(this, _instance)?.executionService.terminateAllSnaps();
    __privateGet(this, _server)?.close();
    await super.teardown();
  }
  /**
   * Install a Snap in the environment. This will terminate any previously
   * installed Snaps, and run the Snap code in a new execution service.
   *
   * @param snapId - The ID of the Snap to install.
   * @param options - The options to use when installing the Snap.
   * @param options.executionService - The execution service to use.
   * @param options.executionServiceOptions - The options to use when creating the
   * execution service, if any. This should only include options specific to the
   * provided execution service.
   * @param options.options - The simulation options.
   * @template Service - The type of the execution service.
   * @returns The installed Snap.
   */
  async installSnap(snapId = this.snapId, options = {}) {
    await __privateGet(this, _instance)?.executionService.terminateAllSnaps();
    __privateSet(this, _instance, await handleInstallSnap(snapId, options));
    return __privateGet(this, _instance);
  }
  /**
   * Get the snap ID for the current environment, which is used if no snap ID is
   * passed to {@link installSnap}. This assumes that the built-in server is
   * running.
   *
   * @returns The snap ID.
   * @throws If the server is not running.
   */
  get snapId() {
    assert(
      __privateGet(this, _server),
      "You must specify a snap ID, because the built-in server is not running."
    );
    const { port } = __privateGet(this, _server).address();
    return `local:http://localhost:${port}`;
  }
};
_options = new WeakMap();
_server = new WeakMap();
_instance = new WeakMap();
var environment_default = SnapsEnvironment;

export {
  SnapsEnvironment,
  environment_default
};
//# sourceMappingURL=chunk-X47QQRYZ.mjs.map