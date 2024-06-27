"use strict";Object.defineProperty(exports, "__esModule", {value: true});




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/ProxyPostMessageStream.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _stream, _jobId, _onData, onData_fn;
var ProxyPostMessageStream = class extends _postmessagestream.BasePostMessageStream {
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
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _onData);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _stream, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _jobId, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _stream, stream);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _jobId, jobId);
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _stream).on("data", _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _onData, onData_fn).bind(this));
  }
  /**
   * Write data to the underlying stream. This wraps the data in an object with
   * the job ID.
   *
   * @param data - The data to write.
   */
  _postMessage(data) {
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _stream).write({
      jobId: _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _jobId),
      data
    });
  }
};
_stream = new WeakMap();
_jobId = new WeakMap();
_onData = new WeakSet();
onData_fn = function(data) {
  if (data.jobId !== _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _jobId)) {
    return;
  }
  this.push(data.data);
};



exports.ProxyPostMessageStream = ProxyPostMessageStream;
//# sourceMappingURL=chunk-7Y6P5FRN.js.map