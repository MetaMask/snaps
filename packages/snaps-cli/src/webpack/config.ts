import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import { builtinModules } from 'module';
import type { Ora } from 'ora';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';
import { EnvironmentPlugin, ProgressPlugin } from 'webpack';

import type { ProcessedWebpackConfig } from '../config';
import {
  SnapsBuiltInResolver,
  SnapsBundleWarningsPlugin,
  SnapsStatsPlugin,
  SnapsWatchPlugin,
} from './plugins';
import {
  BROWSERSLIST_FILE,
  getDefaultLoader,
  getDevTool,
  getProgressHandler,
} from './utils';

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

  /**
   * The spinner to use for logging.
   */
  spinner?: Ora;
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
export async function getDefaultConfiguration(
  config: ProcessedWebpackConfig,
  options: WebpackOptions = {
    evaluate: config.evaluate,
  },
): Promise<Configuration> {
  const spinnerText = options.spinner?.text;
  const builtInResolver =
    config.stats.builtIns &&
    new SnapsBuiltInResolver(config.stats.builtIns, options.spinner);

  return {
    /**
     * The target is set to `browserslist` so that Webpack will compile the
     * bundle to support the browsers specified in the `.browserslistrc` file.
     * This Browserslist file contains the browsers that are supported by
     * MetaMask Snaps.
     *
     * @see https://webpack.js.org/configuration/target/
     */
    target: `browserslist:${BROWSERSLIST_FILE}`,

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
    devtool: getDevTool(config.sourceMap),

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
          test: /\.[tj]sx?$/u,
          exclude: /node_modules/u,
          use: await getDefaultLoader(config),
        },

        config.experimental.wasm && {
          test: /\.wasm$/u,
          use: {
            loader: resolve(__dirname, 'loaders', 'wasm'),
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
      plugins: [builtInResolver],
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
        eval: !options.watch && options.evaluate,
      }),

      /**
       * The `SnapsStatsPlugin` is a Webpack plugin that handles the stats
       * output. It's used to show the stats in the terminal, in a format that
       * is easy to read.
       */
      new SnapsStatsPlugin({ verbose: config.stats.verbose }, options.spinner),

      /**
       * The `EnvironmentPlugin` is a Webpack plugin that adds environment
       * variables to the bundle. We use it to add the `NODE_ENV` and `DEBUG`
       * environment variables.
       */
      new EnvironmentPlugin(config.environment),

      /**
       * The `ProgressPlugin` is a Webpack plugin that logs the progress of
       * the build. We set it to log the progress to the spinner.
       */
      new ProgressPlugin({
        handler: getProgressHandler(options.spinner, spinnerText),
      }),

      /**
       * The `SnapsBundleWarningPlugin` is a Webpack plugin that shows a
       * warning when the bundle is potentially incompatible with MetaMask
       * Snaps.
       */
      new SnapsBundleWarningsPlugin(
        {
          builtInResolver,
          builtIns: Boolean(config.stats.builtIns),
          buffer: config.stats.buffer,
        },
        options.spinner,
      ),

      /**
       * The `WatchPlugin` is a Webpack plugin that adds extra files to watch
       * for changes. This is useful for rebuilding the bundle when the
       * manifest file changes.
       */
      options.watch &&
        new SnapsWatchPlugin(
          {
            bundle: resolve(config.output.path, config.output.filename),
            evaluate: options.evaluate,
            files: [config.manifest.path],
          },
          options.spinner,
        ),
    ].filter(Boolean),

    /**
     * The optimization configuration. This tells Webpack how to optimize the
     * bundle. Most of the time, you won't need to change this, as the default
     * options set by the `mode` option are sufficient.
     */
    optimization: {
      minimize: config.output.minimize,

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
