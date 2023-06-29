import { green, yellow } from 'chalk';
import { isBuiltin } from 'module';
import { Ora } from 'ora';
import {
  Compiler,
  ResolvePluginInstance,
  Resolver,
  WebpackPluginInstance,
} from 'webpack';

import { warn } from '../utils';

/**
 * The options to pass to the {@link SnapsWatchPlugin}.
 */
export type WatchPluginOptions = {
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
  #options: WatchPluginOptions;

  constructor(options: WatchPluginOptions) {
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
   * The name of the resolver hook to tap into.
   */
  #source = 'described-resolve';

  /**
   * The built-in modules that have been imported, but not resolved.
   */
  unresolvedModules: string[] = [];

  /**
   * The options for the plugin.
   */
  #options: SnapsBuiltInResolverOptions;

  /**
   * The spinner to use for logging.
   */
  #spinner?: Ora;

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
            !this.#options.ignore?.includes(baseRequest) &&
            !this.unresolvedModules.includes(baseRequest)
          ) {
            const fallback = resolver.options.fallback.find(
              ({ name }) => name === baseRequest,
            );

            if (fallback && !fallback.alias) {
              warn(
                // TODO: Use `docs.metamask.io` link when available.
                `Attempted to use ${green(
                  `"${baseRequest}"`,
                )}, but no browser fallback has been provided.\nThe MetaMask Snaps CLI does not support Node.js builtins by default. If you want to use this module, you must provide a fallback: https://webpack.js.org/configuration/resolve/#resolvefallback.\nTo disable this warning, set ${yellow(
                  '`plugins.builtInResolver`',
                )} to ${yellow(
                  '`false`',
                )} in your snap config file, or add ${green(
                  `"${baseRequest}"`,
                )} to the ${yellow('`ignore`')} array.`,
                this.#spinner,
              );
              this.unresolvedModules.push(baseRequest);
            }
          }

          return callback();
        },
      );
  }
}
