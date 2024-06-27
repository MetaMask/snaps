import {
  AbstractExecutionService
} from "./chunk-O2IS5QJA.mjs";

// src/services/iframe/IframeExecutionService.ts
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import { createWindow } from "@metamask/snaps-utils";
var IframeExecutionService = class extends AbstractExecutionService {
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
    const iframeWindow = await createWindow(this.iframeUrl.toString(), jobId);
    const stream = new WindowPostMessageStream({
      name: "parent",
      target: "child",
      targetWindow: iframeWindow,
      targetOrigin: "*"
    });
    return { worker: iframeWindow, stream };
  }
};

export {
  IframeExecutionService
};
//# sourceMappingURL=chunk-G6AOB2OP.mjs.map