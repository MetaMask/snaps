"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkNV2VSGCRjs = require('./chunk-NV2VSGCR.js');




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/offscreen/OffscreenExecutionService.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _offscreenPromise;
var OffscreenExecutionService = class extends _chunkNV2VSGCRjs.ProxyExecutionService {
  /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   * @param args.offscreenPromise - A promise that resolves when the offscreen
   * environment is ready.
   */
  constructor({
    messenger,
    setupSnapProvider,
    offscreenPromise
  }) {
    super({
      messenger,
      setupSnapProvider,
      stream: new (0, _postmessagestream.BrowserRuntimePostMessageStream)({
        name: "parent",
        target: "child"
      })
    });
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _offscreenPromise, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _offscreenPromise, offscreenPromise);
  }
  /**
   * Create a new stream for the given job ID. This will wait for the offscreen
   * environment to be ready before creating the stream.
   *
   * @param jobId - The job ID to create a stream for.
   * @returns The stream for the given job ID.
   */
  async initEnvStream(jobId) {
    await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _offscreenPromise);
    return await super.initEnvStream(jobId);
  }
};
_offscreenPromise = new WeakMap();



exports.OffscreenExecutionService = OffscreenExecutionService;
//# sourceMappingURL=chunk-ZQLR62H2.js.map