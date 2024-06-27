import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/ProxyPostMessageStream.ts
import { BasePostMessageStream } from "@metamask/post-message-stream";
var _stream, _jobId, _onData, onData_fn;
var ProxyPostMessageStream = class extends BasePostMessageStream {
  /**
   * Initializes a new `ProxyPostMessageStream` instance.
   *
   * @param args - The constructor arguments.
   * @param args.stream - The underlying stream to use for communication.
   * @param args.jobId - The ID of the job this stream is associated with.
   */
  constructor({ stream, jobId }) {
    super();
    /**
     * Handle incoming data from the underlying stream. This checks that the job
     * ID matches the expected job ID, and pushes the data to the stream if so.
     *
     * @param data - The data to handle.
     */
    __privateAdd(this, _onData);
    __privateAdd(this, _stream, void 0);
    __privateAdd(this, _jobId, void 0);
    __privateSet(this, _stream, stream);
    __privateSet(this, _jobId, jobId);
    __privateGet(this, _stream).on("data", __privateMethod(this, _onData, onData_fn).bind(this));
  }
  /**
   * Write data to the underlying stream. This wraps the data in an object with
   * the job ID.
   *
   * @param data - The data to write.
   */
  _postMessage(data) {
    __privateGet(this, _stream).write({
      jobId: __privateGet(this, _jobId),
      data
    });
  }
};
_stream = new WeakMap();
_jobId = new WeakMap();
_onData = new WeakSet();
onData_fn = function(data) {
  if (data.jobId !== __privateGet(this, _jobId)) {
    return;
  }
  this.push(data.data);
};

export {
  ProxyPostMessageStream
};
//# sourceMappingURL=chunk-ZVOYOZFT.mjs.map