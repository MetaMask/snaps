"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeProcessExecutionService = void 0;
const child_process_1 = require("child_process");
const post_message_stream_1 = require("@metamask/post-message-stream");
const __1 = require("..");
class NodeProcessExecutionService extends __1.AbstractExecutionService {
    async _initEnvStream() {
        const worker = (0, child_process_1.fork)(require.resolve('@metamask/execution-environments/dist/webpack/node-process/bundle.js'));
        const stream = new post_message_stream_1.ProcessParentMessageStream({ process: worker });
        return { worker, stream };
    }
    _terminate(jobWrapper) {
        jobWrapper.worker.kill();
    }
}
exports.NodeProcessExecutionService = NodeProcessExecutionService;
//# sourceMappingURL=NodeProcessExecutionService.js.map