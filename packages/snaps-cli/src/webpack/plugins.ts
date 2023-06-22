import { isBuiltin } from 'module';
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
   * The history of built-in modules that have been resolved.
   */
  #history: string[] = [];

  /**
   * The options for the plugin.
   */
  #options: SnapsBuiltInResolverOptions;

  constructor(
    options: SnapsBuiltInResolverOptions = {
      ignore: [],
    },
  ) {
    this.#options = options;
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
            !this.#history.includes(baseRequest)
          ) {
            const fallback = resolver.options.fallback.find(
              ({ name }) => name === baseRequest,
            );

            if (fallback && !fallback.alias) {
              warn(
                // TODO: Use `docs.metamask.io` link when available.
                `Attempted to use "${baseRequest}", but no browser fallback has been provided.
                The MetaMask Snaps CLI does not support Node.js builtins by default. If you want to use this module, you must provide a fallback: https://webpack.js.org/configuration/resolve/#resolvefallback.
                To disable this warning, set \`plugins.builtInResolver\` to \`false\` in your snap config file, or add "${baseRequest}" to the \`ignore\` array.`,
              );
              this.#history.push(baseRequest);
            }
          }

          return callback();
        },
      );
  }
}
