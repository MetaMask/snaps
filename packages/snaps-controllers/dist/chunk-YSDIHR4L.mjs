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

// src/services/proxy/ProxyExecutionService.ts
import { nanoid } from "nanoid";
var _stream;
var ProxyExecutionService = class extends AbstractExecutionService {
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
    __privateAdd(this, _stream, void 0);
    __privateSet(this, _stream, stream);
  }
  /**
   * Send a termination command to the proxy stream.
   *
   * @param job - The job to terminate.
   */
  async terminateJob(job) {
    __privateGet(this, _stream).write({
      jobId: job.id,
      data: {
        jsonrpc: "2.0",
        method: "terminateJob",
        id: nanoid()
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
    const stream = new ProxyPostMessageStream({
      stream: __privateGet(this, _stream),
      jobId
    });
    await new Promise((resolve) => {
      stream.once("data", resolve);
      stream.write({
        name: "command",
        data: { jsonrpc: "2.0", method: "ping", id: nanoid() }
      });
    });
    return { worker: jobId, stream };
  }
};
_stream = new WeakMap();

export {
  ProxyExecutionService
};
//# sourceMappingURL=chunk-YSDIHR4L.mjs.map