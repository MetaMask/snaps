import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { builtinModules } from 'module';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, EnvironmentPlugin } from 'webpack';

import { ProcessedWebpackConfig } from '../config';
import { SnapsBuiltInResolver, SnapsWatchPlugin } from './plugins';
import { getDevTool } from './utils';

export type WebpackOptions = {
  /**
   * Whether to watch for changes.
   */
  watch?: boolean;

  /**
   * Whether to evaluate the bundle. If this is set, it will override the
   * `evaluate` option in the config object.
   */
  evaluate?: boolean;
};

/**
 * Get the default Webpack configuration. This is the configuration that will
 * be used if the user doesn't provide a custom Webpack configuration. The
 * configuration is based on the snap config.
 *
 * The default configuration includes:
 *
 * - `SWC` to transpile TypeScript and JavaScript files.
 * - `TerserPlugin` to minify the bundle.
 * - `SnapsWebpackPlugin` to validate the bundle and update the manifest.
 *
 * It can be customized through the `customizeWebpackConfig` function in the
 * snap config, but in most cases, you shouldn't need to do that.
 *
 * @param config - The processed snap Webpack config.
 * @param options - The Webpack options.
 * @returns The default Webpack configuration.
 */
export function getDefaultConfiguration(
  config: ProcessedWebpackConfig,
  options: WebpackOptions = {
    evaluate: config.evaluate,
  },
): Configuration {
  return {
    /**
     * `web` is the default target for Webpack, so we don't need to set it, but
     * we do so here for clarity. This ensures that Webpack will build a bundle
     * that can be loaded in a browser.
     *
     * @see https://webpack.js.org/configuration/target/
     */
    target: 'web',

    /**
     * The mode is set to `production` by default, so that Webpack will minify
     * and optimize the bundle.
     *
     * @see https://webpack.js.org/configuration/mode/
     */
    mode: 'production',

    /**
     * The entry point is set to the `input` value from the config object.
     *
     * @see https://webpack.js.org/configuration/entry-context/
     */
    entry: config.input,

    /**
     * The devtool option controls how source maps are generated. We set it to
     * the `sourceMap` value from the config object.
     *
     * @see https://webpack.js.org/configuration/devtool/
     */
    devtool: getDevTool(config),

    /**
     * The stats option controls how much information is printed to the console
     * when Webpack is running. We set it to `none` so that we can control the
     * output ourselves.
     *
     * @see https://webpack.js.org/configuration/stats/
     */
    stats: 'none',

    /**
     * The output options.
     *
     * @see https://webpack.js.org/configuration/output/
     */
    output: {
      /**
       * This indicates whether Webpack should clear the output directory
       * before building. We set it to the `clean` value from the config
       * object.
       *
       * @see https://webpack.js.org/configuration/output/#outputclean
       */
      clean: config.output.clean,

      /**
       * The filename of the bundle. We set it to the `filename` value from
       * the config object.
       *
       * @see https://webpack.js.org/configuration/output/#outputfilename
       */
      filename: config.output.filename,

      /**
       * The path to the output directory. We set it to the `path` value from
       * the config object.
       *
       * @see https://webpack.js.org/configuration/output/#outputpath
       */
      path: config.output.path,

      /**
       * The public path of the bundle. We set it to `/` by default, so that
       * the bundle can be loaded from the root of the server.
       *
       * @see https://webpack.js.org/configuration/output/#outputpublicpath
       */
      publicPath: '/',

      /**
       * The library configuration. This tells Webpack how to export the
       * bundle.
       *
       * @see https://webpack.js.org/configuration/output/#outputlibrary
       */
      library: {
        /**
         * This tells Webpack to export the bundle as a CommonJS module. This
         * is necessary for MetaMask Snaps.
         *
         * @see https://webpack.js.org/configuration/output/#outputlibrarytarget
         */
        type: 'commonjs',
      },
    },

    /**
     * The module configuration. This is where we tell Webpack how to handle
     * different types of files.
     *
     * @see https://webpack.js.org/configuration/module/
     */
    module: {
      rules: [
        {
          /**
           * We use the `swc-loader` to transpile TypeScript and JavaScript
           * files. This is a Webpack loader that uses the `SWC` compiler,
           * which is a much faster alternative to Babel and TypeScript's own
           * compiler.
           *
           * @see https://swc.rs/docs/usage/swc-loader
           */
          test: /\.tsx?$/u,
          exclude: /node_modules/u,
          use: {
            loader: 'swc-loader',

            /**
             * The options for the `swc-loader`. These can be overridden in the
             * `.swcrc` file.
             *
             * @see https://swc.rs/docs/configuration/swcrc
             */
            options: {
              /**
               * This tells SWC to generate source maps. We set it to the
               * `sourceMap` value from the config object.
               *
               * This must be enabled if source maps are enabled in the config.
               */
              sourceMaps: Boolean(getDevTool(config)),

              jsc: {
                /**
                 * MetaMask targets ES2020, so we set the target to ES2020. If
                 * you need to support older browsers, you can set the target
                 * to something lower to include the necessary polyfills.
                 *
                 * @see https://swc.rs/docs/configuration/compilation#jsctarget
                 */
                target: 'es2020',

                parser: {
                  /**
                   * This tells the parser to parse TypeScript files. If you
                   * don't need to support TypeScript, you can set this to
                   * `ecmascript` instead, but there's no harm in leaving it
                   * as `typescript`.
                   *
                   * @see https://swc.rs/docs/configuration/compilation#jscparser
                   */
                  syntax: 'typescript',
                },
              },

              /**
               * The module configuration. This tells SWC how to output the
               * transpiled code.
               *
               * @see https://swc.rs/docs/configuration/modules
               */
              module: {
                /**
                 * This tells SWC to output CommonJS modules. MetaMask Snaps
                 * doesn't support ES modules yet, so this is necessary.
                 *
                 * @see https://swc.rs/docs/configuration/modules#commonjs
                 */
                type: 'commonjs',
              },
            },
          },
        },
      ],
    },

    /**
     * The resolve configuration. This tells Webpack how to resolve imports.
     * We set it to resolve `.js` and `.ts` files.
     *
     * @see https://webpack.js.org/configuration/resolve/
     */
    resolve: {
      /**
       * The extensions to resolve. We set it to resolve `.js` and `.ts`
       * files.
       */
      extensions: ['.js', '.ts'],

      /**
       * The fallback options. This tells Webpack how to handle imports that
       * aren't resolved. By default, we set Node.js built-ins to `false`, so
       * that they are ignored.
       */
      fallback: Object.fromEntries(builtinModules.map((name) => [name, false])),

      /**
       * The plugins to use. We use the {@link SnapsBuiltInResolver} to show
       * warnings about using Node.js built-ins, when no fallback is specified.
       */
      plugins: [
        config.plugins.builtInResolver &&
          new SnapsBuiltInResolver(config.plugins.builtInResolver),
      ],
    },

    /**
     * The plugins to use.
     *
     * @see https://webpack.js.org/configuration/plugins/
     */
    plugins: [
      /**
       * The `SnapsWebpackPlugin` is a Webpack plugin that checks and updates
       * the manifest file, and evaluates the bundle in SES. While not strictly
       * required, it's highly recommended to use this plugin.
       */
      new SnapsWebpackPlugin({
        manifestPath: config.manifest.path,
        writeManifest: config.manifest.update,
        eval: options.evaluate,
      }),

      /**
       * The `WatchPlugin` is a Webpack plugin that adds extra files to watch
       * for changes. This is useful for rebuilding the bundle when the
       * manifest file changes.
       */
      new SnapsWatchPlugin({
        files: [config.manifest.path],
      }),

      /**
       * The `EnvironmentPlugin` is a Webpack plugin that adds environment
       * variables to the bundle. We use it to add the `NODE_ENV` and `DEBUG`
       * environment variables.
       */
      new EnvironmentPlugin(config.environment),
    ],

    /**
     * The optimization configuration. This tells Webpack how to optimize the
     * bundle. Most of the time, you won't need to change this, as the default
     * options set by the `mode` option are sufficient.
     */
    optimization: {
      /**
       * The minimizer to use. We set it to use the `TerserPlugin`.
       */
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },

    /**
     * The infrastructure logging configuration. This tells Webpack how to
     * log messages.
     *
     * @see https://webpack.js.org/configuration/infrastructure-logging
     */
    infrastructureLogging: {
      /**
       * The level of logging to use. We set it to `none`, so that we can
       * control the output ourselves.
       */
      level: 'none',
    },
  };
}
