import {
  getCompiler
} from "./chunk-6ABGZTV7.mjs";

// src/commands/watch/implementation.ts
import { basename } from "path";
async function watch(config, options) {
  const compiler = await getCompiler(config, {
    evaluate: config.evaluate,
    watch: true,
    spinner: options?.spinner
  });
  return new Promise((resolve, reject) => {
    compiler.watch(
      {
        ignored: [
          "**/node_modules/**/*",
          `**/${basename(config.output.path)}/**/*`
        ]
      },
      (watchError) => {
        if (watchError) {
          reject(watchError);
          return;
        }
        resolve(compiler.watching);
      }
    );
  });
}

export {
  watch
};
//# sourceMappingURL=chunk-BAEGXYL7.mjs.map