import {
  getCompiler
} from "./chunk-6ABGZTV7.mjs";

// src/commands/build/implementation.ts
async function build(config, options) {
  const compiler = await getCompiler(config, options);
  return await new Promise((resolve, reject) => {
    compiler.run((runError) => {
      if (runError) {
        reject(runError);
        return;
      }
      compiler.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve();
      });
    });
  });
}

export {
  build
};
//# sourceMappingURL=chunk-CZRGAFVI.mjs.map