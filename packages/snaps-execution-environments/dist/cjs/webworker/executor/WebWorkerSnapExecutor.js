"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WebWorkerSnapExecutor", {
    enumerable: true,
    get: function() {
        return WebWorkerSnapExecutor;
    }
});
const _objectmultiplex = /*#__PURE__*/ _interop_require_default(require("@metamask/object-multiplex"));
const _postmessagestream = require("@metamask/post-message-stream");
const _snapsutils = require("@metamask/snaps-utils");
const _stream = require("stream");
const _BaseSnapExecutor = require("../../common/BaseSnapExecutor");
const _logging = require("../../logging");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class WebWorkerSnapExecutor extends _BaseSnapExecutor.BaseSnapExecutor {
    /**
   * Initialize the WebWorkerSnapExecutor. This creates a post message stream
   * from and to the parent window, for two-way communication with the iframe.
   *
   * @param stream - The stream to use for communication.
   * @returns An instance of `WebWorkerSnapExecutor`, with the initialized post
   * message streams.
   */ static initialize(stream = new _postmessagestream.WebWorkerPostMessageStream()) {
        (0, _logging.log)('Worker: Connecting to parent.');
        const mux = new _objectmultiplex.default();
        (0, _stream.pipeline)(stream, mux, stream, (error)=>{
            if (error) {
                (0, _snapsutils.logError)(`Parent stream failure, closing worker.`, error);
            }
            self.close();
        });
        const commandStream = mux.createStream(_snapsutils.SNAP_STREAM_NAMES.COMMAND);
        const rpcStream = mux.createStream(_snapsutils.SNAP_STREAM_NAMES.JSON_RPC);
        return new WebWorkerSnapExecutor(commandStream, rpcStream);
    }
}

//# sourceMappingURL=WebWorkerSnapExecutor.js.map