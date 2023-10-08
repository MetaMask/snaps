"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NodeThreadExecutionService", {
    enumerable: true,
    get: function() {
        return NodeThreadExecutionService;
    }
});
const _postmessagestream = require("@metamask/post-message-stream");
const _worker_threads = require("worker_threads");
const _ = require("..");
class NodeThreadExecutionService extends _.AbstractExecutionService {
    async initEnvStream() {
        const worker = new _worker_threads.Worker(require.resolve('@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js'));
        const stream = new _postmessagestream.ThreadParentMessageStream({
            thread: worker
        });
        return Promise.resolve({
            worker,
            stream
        });
    }
    async terminateJob(jobWrapper) {
        await jobWrapper.worker.terminate();
    }
}

//# sourceMappingURL=NodeThreadExecutionService.js.map