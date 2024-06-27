import {
  AbstractExecutionService
} from "./chunk-O2IS5QJA.mjs";
import {
  __require
} from "./chunk-YRZVIDCF.mjs";

// src/services/node-js/NodeThreadExecutionService.ts
import { ThreadParentMessageStream } from "@metamask/post-message-stream";
import { Worker } from "worker_threads";
var NodeThreadExecutionService = class extends AbstractExecutionService {
  async initEnvStream() {
    const worker = new Worker(
      __require.resolve(
        "@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js"
      ),
      {
        stdout: true,
        stderr: true
      }
    );
    worker.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    worker.stderr.on("data", (data) => {
      console.error(data.toString());
    });
    const stream = new ThreadParentMessageStream({ thread: worker });
    return Promise.resolve({ worker, stream });
  }
  async terminateJob(jobWrapper) {
    await jobWrapper.worker?.terminate();
  }
};

export {
  NodeThreadExecutionService
};
//# sourceMappingURL=chunk-MP6C6YEV.mjs.map