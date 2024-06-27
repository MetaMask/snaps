"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkBZDIHB7Djs = require('./chunk-BZDIHB7D.js');


var _chunk7Y6P5FRNjs = require('./chunk-7Y6P5FRN.js');




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/webworker/WebWorkerExecutionService.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var _nanoid = require('nanoid');
var WORKER_POOL_ID = "snaps-worker-pool";
var _documentUrl, _runtimeStream;
var WebWorkerExecutionService = class extends _chunkBZDIHB7Djs.AbstractExecutionService {
  /**
   * Create a new webworker execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the worker pool document to use as the
   * execution environment.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */
  constructor({
    documentUrl,
    messenger,
    setupSnapProvider
  }) {
    super({
      messenger,
      setupSnapProvider
    });
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _documentUrl, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _runtimeStream, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _documentUrl, documentUrl);
  }
  /**
   * Send a termination command to the worker pool document.
   *
   * @param job - The job to terminate.
   */
  async terminateJob(job) {
    _utils.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _runtimeStream), "Runtime stream not initialized.");
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _runtimeStream).write({
      jobId: job.id,
      data: {
        jsonrpc: "2.0",
        method: "terminateJob",
        id: _nanoid.nanoid.call(void 0, )
      }
    });
  }
  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  async initEnvStream(jobId) {
    await this.createDocument();
    _utils.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _runtimeStream), "Runtime stream not initialized.");
    const stream = new (0, _chunk7Y6P5FRNjs.ProxyPostMessageStream)({
      stream: _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _runtimeStream),
      jobId
    });
    return { worker: jobId, stream };
  }
  /**
   * Creates the worker pool document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */
  async createDocument() {
    if (document.getElementById(WORKER_POOL_ID)) {
      return;
    }
    const window = await _snapsutils.createWindow.call(void 0, 
      _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _documentUrl).href,
      WORKER_POOL_ID,
      false
    );
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _runtimeStream, new (0, _postmessagestream.WindowPostMessageStream)({
      name: "parent",
      target: "child",
      targetWindow: window,
      targetOrigin: "*"
    }));
  }
};
_documentUrl = new WeakMap();
_runtimeStream = new WeakMap();




exports.WORKER_POOL_ID = WORKER_POOL_ID; exports.WebWorkerExecutionService = WebWorkerExecutionService;
//# sourceMappingURL=chunk-MA252HMR.js.map