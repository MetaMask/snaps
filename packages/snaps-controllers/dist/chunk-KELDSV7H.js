"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQRISQRFIjs = require('./chunk-QRISQRFI.js');


var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/node-js/NodeThreadExecutionService.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _worker_threads = require('worker_threads');
var NodeThreadExecutionService = class extends _chunkQRISQRFIjs.AbstractExecutionService {
  async initEnvStream() {
    const worker = new (0, _worker_threads.Worker)(
      _chunkEXN2TFDJjs.__require.resolve(
        "@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js"
      ),
      {
        stdout: true,
        stderr: true
      }
    );
    worker.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    worker.stderr.on("data", (data) => {
      console.error(data.toString());
    });
    const stream = new (0, _postmessagestream.ThreadParentMessageStream)({ thread: worker });
    return Promise.resolve({ worker, stream });
  }
  async terminateJob(jobWrapper) {
    await jobWrapper.worker?.terminate();
  }
};



exports.NodeThreadExecutionService = NodeThreadExecutionService;
//# sourceMappingURL=chunk-KELDSV7H.js.map