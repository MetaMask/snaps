import {
  evaluate
} from "./chunk-3WWFQLH4.mjs";
import {
  formatText,
  pluralize
} from "./chunk-V6SYDSWM.mjs";
import {
  getErrorMessage
} from "./chunk-7RHK2YTB.mjs";
import {
  error,
  info,
  warn
} from "./chunk-ZAW4ZWQX.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-R77RJHC5.mjs";

// src/webpack/plugins.ts
import { assert, hasProperty, isObject } from "@metamask/utils";
import { bold, dim, red, yellow } from "chalk";
import { isBuiltin } from "module";
import { WebpackError } from "webpack";
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
    __privateAdd(this, _getStatsErrorMessage);
    /**
     * The spinner to use for logging.
     */
    __privateAdd(this, _spinner, void 0);
    this.options = options;
    __privateSet(this, _spinner, spinner);
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
      assert(modules, "Modules must be defined in stats.");
      assert(time, "Time must be defined in stats.");
      if (errors?.length) {
        const formattedErrors = errors.map((statsError) => __privateMethod(this, _getStatsErrorMessage, getStatsErrorMessage_fn).call(this, statsError)).join("\n\n");
        error(
          `Compiled ${modules.length} ${pluralize(
            modules.length,
            "file"
          )} in ${time}ms with ${errors.length} ${pluralize(
            errors.length,
            "error"
          )}.

${formattedErrors}
`,
          __privateGet(this, _spinner)
        );
        __privateGet(this, _spinner)?.stop();
        process.exitCode = 1;
        return;
      }
      if (warnings?.length) {
        const formattedWarnings = warnings.map(
          (statsWarning) => __privateMethod(this, _getStatsErrorMessage, getStatsErrorMessage_fn).call(this, statsWarning, yellow)
        ).join("\n\n");
        warn(
          `Compiled ${modules.length} ${pluralize(
            modules.length,
            "file"
          )} in ${time}ms with ${warnings.length} ${pluralize(
            warnings.length,
            "warning"
          )}.

${formattedWarnings}
`,
          __privateGet(this, _spinner)
        );
      } else {
        info(
          `Compiled ${modules.length} ${pluralize(
            modules.length,
            "file"
          )} in ${time}ms.`,
          __privateGet(this, _spinner)
        );
      }
      if (compiler.watchMode) {
        __privateGet(this, _spinner)?.succeed("Done!");
      }
    });
  }
};
_spinner = new WeakMap();
_getStatsErrorMessage = new WeakSet();
getStatsErrorMessage_fn = function(statsError, color = red) {
  const baseMessage = this.options.verbose ? getErrorMessage(statsError) : statsError.message;
  const [first, ...rest] = baseMessage.split("\n");
  return [
    color(formatText(`\u2022 ${first}`, 4, 2)),
    ...rest.map((message) => formatText(color(message), 4)),
    statsError.details && `
${formatText(dim(statsError.details), 6)}`
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
    __privateAdd(this, _safeEvaluate);
    /**
     * The spinner to use for logging.
     */
    __privateAdd(this, _spinner2, void 0);
    this.options = options;
    __privateSet(this, _spinner2, spinner);
  }
  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler) {
    compiler.hooks.invalid.tap(this.constructor.name, (file) => {
      __privateGet(this, _spinner2)?.start();
      info(`Changes detected in ${yellow(file)}, recompiling.`, __privateGet(this, _spinner2));
    });
    compiler.hooks.afterEmit.tapPromise(
      this.constructor.name,
      async ({ fileDependencies }) => {
        this.options.files?.forEach(
          fileDependencies.add.bind(fileDependencies)
        );
        if (this.options.bundle && this.options.evaluate) {
          await __privateMethod(this, _safeEvaluate, safeEvaluate_fn).call(this, this.options.bundle);
        }
      }
    );
  }
};
_spinner2 = new WeakMap();
_safeEvaluate = new WeakSet();
safeEvaluate_fn = async function(bundlePath) {
  try {
    await evaluate(bundlePath);
    info(`Snap bundle evaluated successfully.`, __privateGet(this, _spinner2));
  } catch (evaluateError) {
    error(evaluateError.message, __privateGet(this, _spinner2));
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
    __privateAdd(this, _source, "described-resolve");
    /**
     * The spinner to use for logging.
     */
    __privateAdd(this, _spinner3, void 0);
    this.options = options;
    __privateSet(this, _spinner3, spinner);
  }
  /**
   * Apply the plugin to the Webpack resolver.
   *
   * @param resolver - The Webpack resolver.
   */
  apply(resolver) {
    resolver.getHook(__privateGet(this, _source)).tapAsync(
      this.constructor.name,
      ({ module: isModule, request }, _, callback) => {
        if (!isModule || !request) {
          return callback();
        }
        const baseRequest = request.split("/")[0];
        if (isBuiltin(baseRequest) && !this.options.ignore?.includes(baseRequest)) {
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
    __privateAdd(this, _checkBuiltIns);
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
    __privateAdd(this, _isProvidePlugin);
    /**
     * Check if the `Buffer` global is used, but not provided by Webpack's
     * `DefinePlugin`.
     *
     * @param compiler - The Webpack compiler.
     */
    __privateAdd(this, _checkBuffer);
    this.options = options;
  }
  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler) {
    if (this.options.builtIns) {
      __privateMethod(this, _checkBuiltIns, checkBuiltIns_fn).call(this, compiler);
    }
    if (this.options.buffer) {
      __privateMethod(this, _checkBuffer, checkBuffer_fn).call(this, compiler);
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
    const webpackError = new WebpackError(
      `The snap attempted to use one or more Node.js builtins, but no browser fallback has been provided. The MetaMask Snaps CLI does not support Node.js builtins by default. If you want to use this module, you must set ${bold(
        "`polyfills`"
      )} to ${bold(
        "`true`"
      )} or an object with the builtins to polyfill as the key and ${bold(
        "`true`"
      )} as the value. To disable this warning, set ${bold(
        "`stats.builtIns`"
      )} to ${bold(
        "`false`"
      )} in your snap config file, or add the module to the ${bold(
        "`stats.builtIns.ignore`"
      )} array.`
    );
    webpackError.details = formattedModules;
    compilation.warnings.push(webpackError);
  });
};
_isProvidePlugin = new WeakSet();
isProvidePlugin_fn = function(instance) {
  return isObject(instance) && instance.constructor.name === "ProvidePlugin" && hasProperty(instance, "definitions");
};
_checkBuffer = new WeakSet();
checkBuffer_fn = function(compiler) {
  const plugin = compiler.options.plugins?.find(
    (instance) => __privateMethod(this, _isProvidePlugin, isProvidePlugin_fn).call(this, instance)
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
          new WebpackError(
            `The snap attempted to use the Node.js Buffer global, which is not supported in the MetaMask Snaps CLI by default. To use the Buffer global, you must polyfill Buffer by setting ${bold(
              "`buffer`"
            )} to ${bold("`true`")} in the ${bold(
              "`polyfills`"
            )} config object in your snap config. To disable this warning, set ${bold(
              "`stats.buffer`"
            )} to ${bold("`false`")} in your snap config file.`
          )
        );
      }
    );
  });
};

export {
  SnapsStatsPlugin,
  SnapsWatchPlugin,
  SnapsBuiltInResolver,
  SnapsBundleWarningsPlugin
};
//# sourceMappingURL=chunk-HOVEQTF3.mjs.map