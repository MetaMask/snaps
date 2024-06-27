import {
  AbstractExecutionService
} from "./chunk-O2IS5QJA.mjs";
import {
  __require
} from "./chunk-YRZVIDCF.mjs";

// src/services/node-js/NodeProcessExecutionService.ts
import { ProcessParentMessageStream } from "@metamask/post-message-stream";
import { fork } from "child_process";
var NodeProcessExecutionService = class extends AbstractExecutionService {
  async initEnvStream() {
    const worker = fork(
      __require.resolve(
        "@metamask/snaps-execution-environments/dist/browserify/node-process/bundle.js"
      ),
      {
        stdio: "pipe"
      }
    );
    worker.stdout?.on("data", (data) => {
      console.log(data.toString());
    });
    worker.stderr?.on("data", (data) => {
      console.error(data.toString());
    });
    const stream = new ProcessParentMessageStream({ process: worker });
    return Promise.resolve({ worker, stream });
  }
  terminateJob(jobWrapper) {
    jobWrapper.worker?.kill();
  }
};

export {
  NodeProcessExecutionService
};
//# sourceMappingURL=chunk-VZ2SURWN.mjs.map