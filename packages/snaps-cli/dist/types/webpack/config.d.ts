import type { Ora } from 'ora';
import type { Configuration } from 'webpack';
import type { ProcessedWebpackConfig } from '../config';
export declare type WebpackOptions = {
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
export declare function getDefaultConfiguration(config: ProcessedWebpackConfig, options?: WebpackOptions): Promise<Configuration>;
