import { yellow } from 'chalk';
import { isBuiltin } from 'module';
import { Ora } from 'ora';
import {
  Compiler,
  ResolvePluginInstance,
  Resolver,
  WebpackPluginInstance,
} from 'webpack';

import { indent, warn } from '../utils';

/**
 * The options to pass to the {@link SnapsWatchPlugin}.
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
  readonly #options: SnapsWatchPluginOptions;

  constructor(options: SnapsWatchPluginOptions) {
    this.#options = options;
  }

  /**
   * Apply the plugin to the Webpack compiler.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler: Compiler) {
    compiler.hooks.afterCompile.tapPromise(
      'WatchPlugin',
      async ({ fileDependencies }) => {
        this.#options.files?.forEach(
          fileDependencies.add.bind(fileDependencies),
        );
      },
    );
  }
}

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
  readonly #resolver: SnapsBuiltInResolver | false;

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
