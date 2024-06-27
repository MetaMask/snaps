import {
  getDefaultConfiguration
} from "./chunk-QRW2GKA3.mjs";

// src/webpack/compiler.ts
import { webpack } from "webpack";
async function getCompiler(config, options) {
  const baseWebpackConfig = await getDefaultConfiguration(config, options);
  const webpackConfig = config.customizeWebpackConfig?.(baseWebpackConfig) ?? baseWebpackConfig;
  return webpack(webpackConfig);
}

export {
  getCompiler
};
//# sourceMappingURL=chunk-6ABGZTV7.mjs.map