"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkMXOKUCLHjs = require('./chunk-MXOKUCLH.js');

// src/webpack/compiler.ts
var _webpack = require('webpack');
async function getCompiler(config, options) {
  const baseWebpackConfig = await _chunkMXOKUCLHjs.getDefaultConfiguration.call(void 0, config, options);
  const webpackConfig = config.customizeWebpackConfig?.(baseWebpackConfig) ?? baseWebpackConfig;
  return _webpack.webpack.call(void 0, webpackConfig);
}



exports.getCompiler = getCompiler;
//# sourceMappingURL=chunk-QMB2ZRWW.js.map