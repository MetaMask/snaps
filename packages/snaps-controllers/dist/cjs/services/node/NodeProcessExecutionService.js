"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NodeProcessExecutionService", {
    enumerable: true,
    get: function() {
        return NodeProcessExecutionService;
    }
});
const _postmessagestream = require("@metamask/post-message-stream");
const _child_process = require("child_process");
const _ = require("..");
class NodeProcessExecutionService extends _.AbstractExecutionService {
    async initEnvStream() {
        const worker = (0, _child_process.fork)(require.resolve('@metamask/snaps-execution-environments/dist/browserify/node-process/bundle.js'));
        const stream = new _postmessagestream.ProcessParentMessageStream({
            process: worker
        });
        return Promise.resolve({
            worker,
            stream
        });
    }
    terminateJob(jobWrapper) {
        jobWrapper.worker.kill();
    }
}

//# sourceMappingURL=NodeProcessExecutionService.js.map