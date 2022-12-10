"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeThreadExecutionService = void 0;
const worker_threads_1 = require("worker_threads");
const post_message_stream_1 = require("@metamask/post-message-stream");
const __1 = require("..");
class NodeThreadExecutionService extends __1.AbstractExecutionService {
    async _initEnvStream() {
        const worker = new worker_threads_1.Worker(require.resolve('@metamask/execution-environments/dist/webpack/node-thread/bundle.js'));
        const stream = new post_message_stream_1.ThreadParentMessageStream({ thread: worker });
        return { worker, stream };
    }
    _terminate(jobWrapper) {
        jobWrapper.worker.terminate();
    }
}
exports.NodeThreadExecutionService = NodeThreadExecutionService;
//# sourceMappingURL=NodeThreadExecutionService.js.map