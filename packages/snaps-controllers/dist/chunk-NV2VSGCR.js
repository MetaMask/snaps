"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk7Y6P5FRNjs = require('./chunk-7Y6P5FRN.js');


var _chunkQRISQRFIjs = require('./chunk-QRISQRFI.js');




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/proxy/ProxyExecutionService.ts
var _nanoid = require('nanoid');
var _stream;
var ProxyExecutionService = class extends _chunkQRISQRFIjs.AbstractExecutionService {
  /**
   * Create a new proxy execution service.
   *
   * @param args - The constructor arguments.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   * @param args.stream - The stream to use for communicating with the proxy
   * executor.
   */
  constructor({
    stream,
    messenger,
    setupSnapProvider
  }) {
    super({
      messenger,
      setupSnapProvider,
      usePing: false
    });
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _stream, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _stream, stream);
  }
  /**
   * Send a termination command to the proxy stream.
   *
   * @param job - The job to terminate.
   */
  async terminateJob(job) {
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _stream).write({
      jobId: job.id,
      data: {
        jsonrpc: "2.0",
        method: "terminateJob",
        id: _nanoid.nanoid.call(void 0, )
      }
    });
  }
  /**
   * Create a new stream for the specified job. This wraps the root stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  async initEnvStream(jobId) {
    const stream = new (0, _chunk7Y6P5FRNjs.ProxyPostMessageStream)({
      stream: _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _stream),
      jobId
    });
    await new Promise((resolve) => {
      stream.once("data", resolve);
      stream.write({
        name: "command",
        data: { jsonrpc: "2.0", method: "ping", id: _nanoid.nanoid.call(void 0, ) }
      });
    });
    return { worker: jobId, stream };
  }
};
_stream = new WeakMap();



exports.ProxyExecutionService = ProxyExecutionService;
//# sourceMappingURL=chunk-NV2VSGCR.js.map