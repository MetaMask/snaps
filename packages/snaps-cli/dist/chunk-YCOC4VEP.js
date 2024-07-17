"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkMUYXNIONjs = require('./chunk-MUYXNION.js');



var _chunkSQXMNT7Mjs = require('./chunk-SQXMNT7M.js');


var _chunkB3NNVTA6js = require('./chunk-B3NNVTA6.js');




var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');





var _chunkX3D3MHWFjs = require('./chunk-X3D3MHWF.js');

// src/webpack/plugins.ts
var _utils = require('@metamask/utils');
var _chalk = require('chalk');
var _module = require('module');
var _webpack = require('webpack');
var _spinner, _getStatsErrorMessage, getStatsErrorMessage_fn;
var SnapsStatsPlugin = class {
  constructor(options = {
    verbose: false
  }, spinner) {
    /**
     * Get the error message for the given stats error.
     *
     * @param statsError - The stats error.
     * @param color - The color to use for the error message.
     * @returns The error message.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _getStatsErrorMessage);
    /**
     * The spinner to use for logging.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _spinner, void 0);
    this.options = options;
    _chunkX3D3MHWFjs.__privateSet.call(void 0, this, _spinner, spinner);
  }
  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler) {
    compiler.hooks.afterDone.tap(this.constructor.name, (stats) => {
      if (!stats) {
        return;
      }
      const { modules, time, errors, warnings } = stats.toJson();
      _utils.assert.call(void 0, modules, "Modules must be defined in stats.");
      _utils.assert.call(void 0, time, "Time must be defined in stats.");
      if (errors?.length) {
        const formattedErrors = errors.map((statsError) => _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _getStatsErrorMessage, getStatsErrorMessage_fn).call(this, statsError)).join("\n\n");
        _chunkTJ2F3J6Xjs.error.call(void 0, 
          `Compiled ${modules.length} ${_chunkSQXMNT7Mjs.pluralize.call(void 0, 
            modules.length,
            "file"
          )} in ${time}ms with ${errors.length} ${_chunkSQXMNT7Mjs.pluralize.call(void 0, 
            errors.length,
            "error"
          )}.

${formattedErrors}
`,
          _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner)
        );
        _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner)?.stop();
        process.exitCode = 1;
        return;
      }
      if (warnings?.length) {
        const formattedWarnings = warnings.map(
          (statsWarning) => _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _getStatsErrorMessage, getStatsErrorMessage_fn).call(this, statsWarning, _chalk.yellow)
        ).join("\n\n");
        _chunkTJ2F3J6Xjs.warn.call(void 0, 
          `Compiled ${modules.length} ${_chunkSQXMNT7Mjs.pluralize.call(void 0, 
            modules.length,
            "file"
          )} in ${time}ms with ${warnings.length} ${_chunkSQXMNT7Mjs.pluralize.call(void 0, 
            warnings.length,
            "warning"
          )}.

${formattedWarnings}
`,
          _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner)
        );
      } else {
        _chunkTJ2F3J6Xjs.info.call(void 0, 
          `Compiled ${modules.length} ${_chunkSQXMNT7Mjs.pluralize.call(void 0, 
            modules.length,
            "file"
          )} in ${time}ms.`,
          _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner)
        );
      }
      if (compiler.watchMode) {
        _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner)?.succeed("Done!");
      }
    });
  }
};
_spinner = new WeakMap();
_getStatsErrorMessage = new WeakSet();
getStatsErrorMessage_fn = function(statsError, color = _chalk.red) {
  const baseMessage = this.options.verbose ? _chunkB3NNVTA6js.getErrorMessage.call(void 0, statsError) : statsError.message;
  const [first, ...rest] = baseMessage.split("\n");
  return [
    color(_chunkSQXMNT7Mjs.formatText.call(void 0, `\u2022 ${first}`, 4, 2)),
    ...rest.map((message) => _chunkSQXMNT7Mjs.formatText.call(void 0, color(message), 4)),
    statsError.details && `
${_chunkSQXMNT7Mjs.formatText.call(void 0, _chalk.dim.call(void 0, statsError.details), 6)}`
  ].filter(Boolean).join("\n");
};
var _spinner2, _safeEvaluate, safeEvaluate_fn;
var SnapsWatchPlugin = class {
  constructor(options, spinner) {
    /**
     * Safely evaluate the bundle at the given path. If an error occurs, it will
     * be logged to the console, rather than throwing an error.
     *
     * This function should never throw an error.
     *
     * @param bundlePath - The path to the bundle.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _safeEvaluate);
    /**
     * The spinner to use for logging.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _spinner2, void 0);
    this.options = options;
    _chunkX3D3MHWFjs.__privateSet.call(void 0, this, _spinner2, spinner);
  }
  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler) {
    compiler.hooks.invalid.tap(this.constructor.name, (file) => {
      _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner2)?.start();
      _chunkTJ2F3J6Xjs.info.call(void 0, `Changes detected in ${_chalk.yellow.call(void 0, file)}, recompiling.`, _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner2));
    });
    compiler.hooks.afterEmit.tapPromise(
      this.constructor.name,
      async ({ fileDependencies }) => {
        this.options.files?.forEach(
          fileDependencies.add.bind(fileDependencies)
        );
        if (this.options.bundle && this.options.evaluate) {
          await _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _safeEvaluate, safeEvaluate_fn).call(this, this.options.bundle);
        }
      }
    );
  }
};
_spinner2 = new WeakMap();
_safeEvaluate = new WeakSet();
safeEvaluate_fn = async function(bundlePath) {
  try {
    await _chunkMUYXNIONjs.evaluate.call(void 0, bundlePath);
    _chunkTJ2F3J6Xjs.info.call(void 0, `Snap bundle evaluated successfully.`, _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner2));
  } catch (evaluateError) {
    _chunkTJ2F3J6Xjs.error.call(void 0, evaluateError.message, _chunkX3D3MHWFjs.__privateGet.call(void 0, this, _spinner2));
  }
};
var _source, _spinner3;
var SnapsBuiltInResolver = class {
  constructor(options = {
    ignore: []
  }, spinner) {
    /**
     * The built-in modules that have been imported, but not resolved.
     */
    this.unresolvedModules = /* @__PURE__ */ new Set();
    /**
     * The name of the resolver hook to tap into.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _source, "described-resolve");
    /**
     * The spinner to use for logging.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _spinner3, void 0);
    this.options = options;
    _chunkX3D3MHWFjs.__privateSet.call(void 0, this, _spinner3, spinner);
  }
  /**
   * Apply the plugin to the Webpack resolver.
   *
   * @param resolver - The Webpack resolver.
   */
  apply(resolver) {
    resolver.getHook(_chunkX3D3MHWFjs.__privateGet.call(void 0, this, _source)).tapAsync(
      this.constructor.name,
      ({ module: isModule, request }, _, callback) => {
        if (!isModule || !request) {
          return callback();
        }
        const baseRequest = request.split("/")[0];
        if (_module.isBuiltin.call(void 0, baseRequest) && !this.options.ignore?.includes(baseRequest)) {
          const fallback = resolver.options.fallback.find(
            ({ name }) => name === baseRequest
          );
          if (fallback && !fallback.alias) {
            this.unresolvedModules.add(baseRequest);
          }
        }
        return callback();
      }
    );
  }
};
_source = new WeakMap();
_spinner3 = new WeakMap();
var _checkBuiltIns, checkBuiltIns_fn, _isProvidePlugin, isProvidePlugin_fn, _checkBuffer, checkBuffer_fn;
var SnapsBundleWarningsPlugin = class {
  constructor(options = {
    buffer: true,
    builtIns: true
  }) {
    /**
     * Check if a built-in module is used, but not provided by Webpack's
     * `fallback` configuration.
     *
     * @param compiler - The Webpack compiler.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _checkBuiltIns);
    /**
     * Check if the given instance is a `ProvidePlugin`. This is not guaranteed to
     * be accurate, but it's good enough for our purposes. If we were to use
     * `instanceof` instead, it might not work if multiple versions of Webpack are
     * installed.
     *
     * @param instance - The instance to check.
     * @returns Whether the instance is a `ProvidePlugin`, i.e., whether it's an
     * object with the name `ProvidePlugin` and a `definitions` property.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _isProvidePlugin);
    /**
     * Check if the `Buffer` global is used, but not provided by Webpack's
     * `DefinePlugin`.
     *
     * @param compiler - The Webpack compiler.
     */
    _chunkX3D3MHWFjs.__privateAdd.call(void 0, this, _checkBuffer);
    this.options = options;
  }
  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler) {
    if (this.options.builtIns) {
      _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _checkBuiltIns, checkBuiltIns_fn).call(this, compiler);
    }
    if (this.options.buffer) {
      _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _checkBuffer, checkBuffer_fn).call(this, compiler);
    }
  }
};
_checkBuiltIns = new WeakSet();
checkBuiltIns_fn = function(compiler) {
  compiler.hooks.afterCompile.tap(this.constructor.name, (compilation) => {
    if (!this.options.builtInResolver) {
      return;
    }
    const { unresolvedModules } = this.options.builtInResolver;
    if (unresolvedModules.size === 0) {
      return;
    }
    const formattedModules = new Array(...unresolvedModules).map((name) => `\u2022 ${name}`).join("\n");
    const webpackError = new (0, _webpack.WebpackError)(
      `The snap attempted to use one or more Node.js builtins, but no browser fallback has been provided. The MetaMask Snaps CLI does not support Node.js builtins by default. If you want to use this module, you must set ${_chalk.bold.call(void 0, 
        "`polyfills`"
      )} to ${_chalk.bold.call(void 0, 
        "`true`"
      )} or an object with the builtins to polyfill as the key and ${_chalk.bold.call(void 0, 
        "`true`"
      )} as the value. To disable this warning, set ${_chalk.bold.call(void 0, 
        "`stats.builtIns`"
      )} to ${_chalk.bold.call(void 0, 
        "`false`"
      )} in your snap config file, or add the module to the ${_chalk.bold.call(void 0, 
        "`stats.builtIns.ignore`"
      )} array.`
    );
    webpackError.details = formattedModules;
    compilation.warnings.push(webpackError);
  });
};
_isProvidePlugin = new WeakSet();
isProvidePlugin_fn = function(instance) {
  return _utils.isObject.call(void 0, instance) && instance.constructor.name === "ProvidePlugin" && _utils.hasProperty.call(void 0, instance, "definitions");
};
_checkBuffer = new WeakSet();
checkBuffer_fn = function(compiler) {
  const plugin = compiler.options.plugins?.find(
    (instance) => _chunkX3D3MHWFjs.__privateMethod.call(void 0, this, _isProvidePlugin, isProvidePlugin_fn).call(this, instance)
  );
  if (plugin) {
    const { definitions } = plugin;
    if (definitions.Buffer) {
      return;
    }
  }
  compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
    compilation.hooks.afterProcessAssets.tap(
      this.constructor.name,
      (assets) => {
        const bufferAssets = Object.entries(assets).filter(([name]) => name.endsWith(".js")).filter(([, asset]) => asset.source().includes("Buffer"));
        if (bufferAssets.length === 0) {
          return;
        }
        compilation.warnings.push(
          new (0, _webpack.WebpackError)(
            `The snap attempted to use the Node.js Buffer global, which is not supported in the MetaMask Snaps CLI by default. To use the Buffer global, you must polyfill Buffer by setting ${_chalk.bold.call(void 0, 
              "`buffer`"
            )} to ${_chalk.bold.call(void 0, "`true`")} in the ${_chalk.bold.call(void 0, 
              "`polyfills`"
            )} config object in your snap config. To disable this warning, set ${_chalk.bold.call(void 0, 
              "`stats.buffer`"
            )} to ${_chalk.bold.call(void 0, "`false`")} in your snap config file.`
          )
        );
      }
    );
  });
};






exports.SnapsStatsPlugin = SnapsStatsPlugin; exports.SnapsWatchPlugin = SnapsWatchPlugin; exports.SnapsBuiltInResolver = SnapsBuiltInResolver; exports.SnapsBundleWarningsPlugin = SnapsBundleWarningsPlugin;
//# sourceMappingURL=chunk-YCOC4VEP.js.map