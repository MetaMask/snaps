import {
  ProxyExecutionService
} from "./chunk-6PDHWCA7.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/offscreen/OffscreenExecutionService.ts
import { BrowserRuntimePostMessageStream } from "@metamask/post-message-stream";
var _offscreenPromise;
var OffscreenExecutionService = class extends ProxyExecutionService {
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
      stream: new BrowserRuntimePostMessageStream({
        name: "parent",
        target: "child"
      })
    });
    __privateAdd(this, _offscreenPromise, void 0);
    __privateSet(this, _offscreenPromise, offscreenPromise);
  }
  /**
   * Create a new stream for the given job ID. This will wait for the offscreen
   * environment to be ready before creating the stream.
   *
   * @param jobId - The job ID to create a stream for.
   * @returns The stream for the given job ID.
   */
  async initEnvStream(jobId) {
    await __privateGet(this, _offscreenPromise);
    return await super.initEnvStream(jobId);
  }
};
_offscreenPromise = new WeakMap();

export {
  OffscreenExecutionService
};
//# sourceMappingURL=chunk-UKIUDSUW.mjs.map