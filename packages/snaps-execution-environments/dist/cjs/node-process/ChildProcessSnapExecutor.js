"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChildProcessSnapExecutor", {
    enumerable: true,
    get: function() {
        return ChildProcessSnapExecutor;
    }
});
const _objectmultiplex = /*#__PURE__*/ _interop_require_default(require("@metamask/object-multiplex"));
const _postmessagestream = require("@metamask/post-message-stream");
const _snapsutils = require("@metamask/snaps-utils");
const _stream = require("stream");
const _BaseSnapExecutor = require("../common/BaseSnapExecutor");
const _logging = require("../logging");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class ChildProcessSnapExecutor extends _BaseSnapExecutor.BaseSnapExecutor {
    static initialize() {
        (0, _logging.log)('Worker: Connecting to parent.');
        const parentStream = new _postmessagestream.ProcessMessageStream();
        const mux = new _objectmultiplex.default();
        (0, _stream.pipeline)(parentStream, mux, parentStream, (error)=>{
            if (error) {
                (0, _snapsutils.logError)(`Parent stream failure, closing worker.`, error);
            }
            self.close();
        });
        const commandStream = mux.createStream(_snapsutils.SNAP_STREAM_NAMES.COMMAND);
        const rpcStream = mux.createStream(_snapsutils.SNAP_STREAM_NAMES.JSON_RPC);
        return new ChildProcessSnapExecutor(commandStream, rpcStream);
    }
}

//# sourceMappingURL=ChildProcessSnapExecutor.js.map