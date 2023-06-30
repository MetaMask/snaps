import { yellow } from 'chalk';
import { isBuiltin } from 'module';
import { Ora } from 'ora';
import {
  Compiler,
  ProvidePlugin,
  ResolvePluginInstance,
  Resolver,
  WebpackPluginInstance,
} from 'webpack';

import { indent, info, warn } from '../utils';

/**
 * The options for the {@link SnapsWatchPlugin}.
 */
export type SnapsWatchPluginOptions = {
  /**
   * The extra files to watch.
   */
  files?: string[];
};

/**
 * A plugin that adds extra files to watch. This is useful for watching files
 * that are not imported by the entry point, such as the `snap.manifest.json`
 * file.
 */
export class SnapsWatchPlugin implements WebpackPluginInstance {
  /**
   * The options for the plugin.
   */
  readonly #options: SnapsWatchPluginOptions;

  /**
   * The spinner to use for logging.
   */
  readonly #spinner?: Ora;

  constructor(options: SnapsWatchPluginOptions, spinner?: Ora) {
    this.#options = options;
    this.#spinner = spinner;
  }

  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler: Compiler) {
    compiler.hooks.invalid.tap(this.constructor.name, (file) => {
      this.#spinner?.start();
      info(`Changes detected in ${yellow(file)}, recompiling.`, this.#spinner);
    });

    compiler.hooks.afterEmit.tapPromise(
      this.constructor.name,
      async ({ fileDependencies }) => {
        this.#options.files?.forEach(
          fileDependencies.add.bind(fileDependencies),
        );
      },
    );
  }
}

/**
 * The options for the {@link SnapsBuiltInResolver}.
 */
export type SnapsBuiltInResolverOptions = {
  /**
   * The built-in modules to ignore.
   */
  ignore?: string[];
};

/**
 * A plugin that logs a message when a built-in module is not resolved. The
 * MetaMask Snaps CLI does not support built-in modules by default, and this
 * plugin is used to warn the user when they try to import a built-in module,
 * when no fallback is configured.
 */
export class SnapsBuiltInResolver implements ResolvePluginInstance {
  /**
   * The built-in modules that have been imported, but not resolved.
   */
  readonly unresolvedModules = new Set<string>();

  /**
   * The name of the resolver hook to tap into.
   */
  readonly #source = 'described-resolve';

  /**
   * The options for the plugin.
   */
  readonly #options: SnapsBuiltInResolverOptions;

  /**
   * The spinner to use for logging.
   */
  readonly #spinner?: Ora;

  constructor(
    options: SnapsBuiltInResolverOptions = {
      ignore: [],
    },
    spinner?: Ora,
  ) {
    this.#options = options;
    this.#spinner = spinner;
  }

  /**
   * Apply the plugin to the Webpack resolver.
   *
   * @param resolver - The Webpack resolver.
   */
  apply(resolver: Resolver) {
    resolver
      .getHook(this.#source)
      .tapAsync(
        this.constructor.name,
        ({ module: isModule, request }, _, callback) => {
          if (!isModule || !request) {
            return callback();
          }

          const baseRequest = request.split('/')[0];
          if (
            isBuiltin(baseRequest) &&
            !this.#options.ignore?.includes(baseRequest)
          ) {
            const fallback = resolver.options.fallback.find(
              ({ name }) => name === baseRequest,
            );

            if (fallback && !fallback.alias) {
              this.unresolvedModules.add(baseRequest);
            }
          }

          return callback();
        },
      );
  }
}

/**
 * A plugin that logs a message when a built-in module is not resolved. The
 * MetaMask Snaps CLI does not support built-in modules by default, and this
 * plugin is used to warn the user when they try to import a built-in module,
 * when no fallback is configured.
 *
 * We use both a resolver and a plugin, because the resolver is used to detect
 * when a built-in module is imported, and the plugin is used to log a single
 * message when the compilation is complete. We can't do everything in a single
 * plugin, because the resolver doesn't have access to the compilation, and the
 * plugin doesn't have access to the resolver.
 */
export class SnapsBuiltInResolverPlugin implements WebpackPluginInstance {
  /**
   * The resolver to use for detecting built-in modules.
   */
  readonly #resolver: SnapsBuiltInResolver | false;

  /**
   * The spinner to use for logging.
   */
  readonly #spinner?: Ora;

  constructor(resolver: SnapsBuiltInResolver | false, spinner?: Ora) {
    this.#resolver = resolver;
    this.#spinner = spinner;
  }

  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler: Compiler) {
    compiler.hooks.afterCompile.tap(this.constructor.name, () => {
      if (!this.#resolver) {
        return;
      }

      const { unresolvedModules } = this.#resolver;
      if (unresolvedModules.size === 0) {
        return;
      }

      const formattedModules = new Array(...unresolvedModules)
        .map((name) => indent(`• ${name}`, 2))
        .join('\n');

      warn(
        `The snap attempted to use one or more Node.js builtins, but no browser fallback has been provided.\n` +
          `The MetaMask Snaps CLI does not support Node.js builtins by default. If you want to use this module, you must provide a fallback: https://webpack.js.org/configuration/resolve/#resolvefallback.\n` +
          `To disable this warning, set ${yellow(
            '`plugins.builtInResolver`',
          )} to ${yellow(
            '`false`',
          )} in your snap config file, or add the module to the ${yellow(
            '`plugins.builtInResolver.ignore`',
          )} array.\n\n${formattedModules}\n`,
        this.#spinner,
      );
    });
  }
}

/**
 * The options for the {@link SnapsBundleWarningsPlugin}.
 */
export type SnapsBundleWarningsPluginOptions = {
  /**
   * Whether to show warnings if the `Buffer` global is used, but not provided
   * by Webpack's `DefinePlugin`.
   */
  buffer?: boolean;
};

/**
 * A plugin that logs a message when a snap uses the `Buffer` global. The
 * MetaMask Snaps CLI does not support the `Buffer` global by default, and this
 * plugin is used to warn the user when they try to use the `Buffer` global.
 */
export class SnapsBundleWarningsPlugin implements WebpackPluginInstance {
  /**
   * The spinner to use for logging.
   */
  readonly #spinner?: Ora;

  /**
   * The options for the plugin.
   */
  readonly #options: SnapsBundleWarningsPluginOptions;

  constructor(
    options: SnapsBundleWarningsPluginOptions = {
      buffer: true,
    },
    spinner?: Ora,
  ) {
    this.#options = options;
    this.#spinner = spinner;
  }

  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler: Compiler) {
    if (this.#options.buffer) {
      this.#checkBuffer(compiler);
    }
  }

  /**
   * Check if the `Buffer` global is used, but not provided by Webpack's
   * `DefinePlugin`.
   *
   * @param compiler - The Webpack compiler.
   */
  #checkBuffer(compiler: Compiler) {
    const plugin = compiler.options.plugins?.find(
      (instance) => instance instanceof ProvidePlugin,
    ) as ProvidePlugin | undefined;

    // If the `ProvidePlugin` is configured to provide `Buffer`, then we don't
    // need to warn the user.
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
          // Check if assets use `Buffer`.
          const bufferAssets = Object.entries(assets)
            .filter(([name]) => name.endsWith('.js'))
            .filter(([, asset]) => asset.source().includes('Buffer'));

          if (bufferAssets.length === 0) {
            return;
          }

          warn(
            `The snap attempted to use the Node.js Buffer global, which is not supported by the MetaMask Snaps CLI.\n` +
              `To use the Buffer global, you must use the ${yellow(
                '`ProvidePlugin`',
              )} to inject it: https://webpack.js.org/plugins/provide-plugin/.\n` +
              `To disable this warning, set ${yellow(
                '`plugins.bundleWarning`',
              )} to ${yellow('`false`')} in your snap config file.`,
            this.#spinner,
          );
        },
      );
    });
  }
}
