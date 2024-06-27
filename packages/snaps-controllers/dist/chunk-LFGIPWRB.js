"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkBZDIHB7Djs = require('./chunk-BZDIHB7D.js');

// src/services/iframe/IframeExecutionService.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _snapsutils = require('@metamask/snaps-utils');
var IframeExecutionService = class extends _chunkBZDIHB7Djs.AbstractExecutionService {
  constructor({
    iframeUrl,
    messenger,
    setupSnapProvider
  }) {
    super({
      messenger,
      setupSnapProvider
    });
    this.iframeUrl = iframeUrl;
  }
  terminateJob(jobWrapper) {
    document.getElementById(jobWrapper.id)?.remove();
  }
  async initEnvStream(jobId) {
    const iframeWindow = await _snapsutils.createWindow.call(void 0, this.iframeUrl.toString(), jobId);
    const stream = new (0, _postmessagestream.WindowPostMessageStream)({
      name: "parent",
      target: "child",
      targetWindow: iframeWindow,
      targetOrigin: "*"
    });
    return { worker: iframeWindow, stream };
  }
};



exports.IframeExecutionService = IframeExecutionService;
//# sourceMappingURL=chunk-LFGIPWRB.js.map