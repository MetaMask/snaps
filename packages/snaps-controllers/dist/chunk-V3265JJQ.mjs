import {
  ProxyPostMessageStream
} from "./chunk-ZVOYOZFT.mjs";
import {
  AbstractExecutionService
} from "./chunk-TSDUJNOP.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/webworker/WebWorkerExecutionService.ts
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import { createWindow } from "@metamask/snaps-utils";
import { assert } from "@metamask/utils";
import { nanoid } from "nanoid";
var WORKER_POOL_ID = "snaps-worker-pool";
var _documentUrl, _runtimeStream;
var WebWorkerExecutionService = class extends AbstractExecutionService {
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
    __privateAdd(this, _documentUrl, void 0);
    __privateAdd(this, _runtimeStream, void 0);
    __privateSet(this, _documentUrl, documentUrl);
  }
  /**
   * Send a termination command to the worker pool document.
   *
   * @param job - The job to terminate.
   */
  async terminateJob(job) {
    assert(__privateGet(this, _runtimeStream), "Runtime stream not initialized.");
    __privateGet(this, _runtimeStream).write({
      jobId: job.id,
      data: {
        jsonrpc: "2.0",
        method: "terminateJob",
        id: nanoid()
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
    assert(__privateGet(this, _runtimeStream), "Runtime stream not initialized.");
    const stream = new ProxyPostMessageStream({
      stream: __privateGet(this, _runtimeStream),
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
    const window = await createWindow(
      __privateGet(this, _documentUrl).href,
      WORKER_POOL_ID,
      false
    );
    __privateSet(this, _runtimeStream, new WindowPostMessageStream({
      name: "parent",
      target: "child",
      targetWindow: window,
      targetOrigin: "*"
    }));
  }
};
_documentUrl = new WeakMap();
_runtimeStream = new WeakMap();

export {
  WORKER_POOL_ID,
  WebWorkerExecutionService
};
//# sourceMappingURL=chunk-V3265JJQ.mjs.map