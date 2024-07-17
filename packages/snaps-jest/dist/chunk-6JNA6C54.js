"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunk2RJYSYUBjs = require('./chunk-2RJYSYUB.js');


var _chunkFX4D4J6Yjs = require('./chunk-FX4D4J6Y.js');


var _chunkN6MAO223js = require('./chunk-N6MAO223.js');


var _chunkTZB4LBT7js = require('./chunk-TZB4LBT7.js');




var _chunkPHUTP7NBjs = require('./chunk-PHUTP7NB.js');

// src/environment.ts
var _utils = require('@metamask/utils');
var _jestenvironmentnode = require('jest-environment-node'); var _jestenvironmentnode2 = _interopRequireDefault(_jestenvironmentnode);
var log = _utils.createModuleLogger.call(void 0, _chunkTZB4LBT7js.rootLogger, "environment");
var _options, _server, _instance;
var SnapsEnvironment = class extends _jestenvironmentnode2.default {
  /**
   * Constructor.
   *
   * @param options - The environment options.
   * @param context - The environment context.
   */
  constructor(options, context) {
    super(options, context);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _options, void 0);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _server, void 0);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _instance, void 0);
    _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _options, _chunk2RJYSYUBjs.getOptions.call(void 0, options.projectConfig.testEnvironmentOptions));
  }
  /**
   * Set up the environment. This starts the built-in HTTP server, and creates a
   * new browser instance.
   */
  async setup() {
    await super.setup();
    if (_chunkPHUTP7NBjs.__privateGet.call(void 0, this, _options).server.enabled) {
      log("Starting server.");
      _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _server, await _chunkN6MAO223js.startServer.call(void 0, _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _options).server));
    }
    this.global.snapsEnvironment = this;
  }
  /**
   * Tear down the environment. This closes the browser, and stops the built-in
   * HTTP server.
   */
  async teardown() {
    await _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _instance)?.executionService.terminateAllSnaps();
    _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _server)?.close();
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
    await _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _instance)?.executionService.terminateAllSnaps();
    _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _instance, await _chunkFX4D4J6Yjs.handleInstallSnap.call(void 0, snapId, options));
    return _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _instance);
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
    _utils.assert.call(void 0, 
      _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _server),
      "You must specify a snap ID, because the built-in server is not running."
    );
    const { port } = _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _server).address();
    return `local:http://localhost:${port}`;
  }
};
_options = new WeakMap();
_server = new WeakMap();
_instance = new WeakMap();
var environment_default = SnapsEnvironment;




exports.SnapsEnvironment = SnapsEnvironment; exports.environment_default = environment_default;
//# sourceMappingURL=chunk-6JNA6C54.js.map