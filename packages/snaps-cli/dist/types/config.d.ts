import type { Infer } from '@metamask/superstruct';
import type { BrowserifyObject } from 'browserify';
import type { Configuration as WebpackConfiguration } from 'webpack';
import { TranspilationModes } from './builders';
import type { YargsArgs } from './types/yargs';
/**
 * The configuration for the Snaps CLI, stored as `snap.config.js` or
 * `snap.config.ts` in the root of the project.
 *
 * @deprecated The Browserify bundler is deprecated and will be removed in a
 * future release. Use the Webpack bundler instead.
 */
export declare type SnapBrowserifyConfig = {
    /**
     * The bundler to use to build the snap. For backwards compatibility, if not
     * specified, Browserify will be used. However, the Browserify bundler is
     * deprecated and will be removed in a future release, so it's recommended to
     * use the Webpack bundler instead.
     */
    bundler: 'browserify';
    /**
     * The options for the Snaps CLI. These are merged with the options passed to
     * the CLI, with the CLI options taking precedence.
     *
     * @deprecated The Browserify bundler is deprecated and will be removed in a
     * future release. Use the Webpack bundler instead.
     */
    cliOptions?: {
        /**
         * The path to the snap bundle file.
         *
         * @default 'dist/bundle.js'
         */
        bundle?: string;
        /**
         * The directory to output the snap to. This is only used if `bundle` is
         * not specified.
         *
         * @default 'dist'
         */
        dist?: string;
        /**
         * Whether to attempt to evaluate the snap in SES. This can catch some errors
         * that would otherwise only be caught at runtime.
         *
         * @default true
         */
        eval?: boolean;
        /**
         * Whether to validate the snap manifest.
         *
         * @default true
         */
        manifest?: boolean;
        /**
         * The name of the bundle file. This is only used if `bundle` is not
         * specified.
         *
         * @default 'bundle.js'
         */
        outfileName?: string;
        /**
         * The port to run the server on.
         *
         * @default 8081
         */
        port?: number;
        /**
         * The root directory to serve the snap from.
         *
         * @default `process.cwd()`
         */
        root?: string;
        /**
         * Whether to generate source maps for the snap bundle.
         *
         * @default false
         */
        sourceMaps?: boolean;
        /**
         * The path to the snap entry point.
         *
         * @default 'src/index.js'
         */
        src?: string;
        /**
         * Whether to remove comments from the bundle.
         *
         * @default true
         */
        stripComments?: boolean;
        /**
         * Whether to suppress warnings.
         *
         * @default false
         */
        suppressWarnings?: boolean;
        /**
         * The transpilation mode to use, which determines which files are
         * transpiled.
         *
         * - `'localAndDeps'`: Transpile the snap entry point and all dependencies.
         * - `'localOnly'`: Transpile only the snap entry point.
         * - `'none'`: Don't transpile any files.
         *
         * @default 'localOnly'
         */
        transpilationMode?: 'localAndDeps' | 'localOnly' | 'none';
        /**
         * The dependencies to transpile when `transpilationMode` is set to
         * `'localAndDeps'`. If not specified, all dependencies will be transpiled.
         */
        depsToTranspile?: string[];
        /**
         * Whether to show original errors.
         *
         * @default true
         */
        verboseErrors?: boolean;
        /**
         * Whether to write the updated manifest to disk.
         *
         * @default true
         */
        writeManifest?: boolean;
        /**
         * Whether to serve the snap locally.
         *
         * @default true
         */
        serve?: boolean;
    };
    /**
     * A function that can be used to customize the Browserify instance used to
     * build the snap.
     *
     * @param bundler - The Browserify instance.
     * @deprecated The Browserify bundler is deprecated and will be removed in a
     * future release. Use the Webpack bundler instead.
     */
    bundlerCustomizer?: (bundler: BrowserifyObject) => void;
};
/**
 * The configuration for the Snaps CLI, stored as `snap.config.js` or
 * `snap.config.ts` in the root of the project.
 */
export declare type SnapWebpackConfig = {
    /**
     * The bundler to use to build the snap. For backwards compatibility, if not
     * specified, Browserify will be used. However, the Browserify bundler is
     * deprecated and will be removed in a future release, so it's recommended to
     * use the Webpack bundler instead.
     */
    bundler?: 'webpack';
    /**
     * The path to the snap entry point. This should be a JavaScript or TypeScript
     * file.
     */
    input: string;
    /**
     * Whether to generate source maps for the snap. If `true`, source maps will
     * be generated as separate files. If `'inline'`, source maps will be
     * inlined in the generated JavaScript bundle.
     *
     * @default true
     */
    sourceMap?: boolean | 'inline';
    /**
     * Whether to attempt to evaluate the snap in SES. This can catch some errors
     * that would otherwise only be caught at runtime.
     *
     * @default true
     */
    evaluate?: boolean;
    output?: {
        /**
         * The path to the directory where the snap will be built. This directory
         * will be created if it doesn't exist.
         *
         * If the path is relative, it will be resolved relative to the current
         * working directory.
         *
         * @default 'dist'
         */
        path?: string;
        /**
         * The name of the JavaScript bundle file.
         *
         * @default 'bundle.js'
         */
        filename?: string;
        /**
         * Whether to clean the output directory before building the snap. If
         * `true`, the output directory will be deleted and recreated. Otherwise,
         * the output directory will be left as-is.
         *
         * @default false
         */
        clean?: boolean;
        /**
         * Whether to minimize the snap bundle. If `true`, the bundle will be
         * minified. Otherwise, the bundle will be left as-is.
         *
         * @default true
         */
        minimize?: boolean;
    };
    manifest?: {
        /**
         * The path to the snap manifest file. If the path is relative, it will be
         * resolved relative to the current working directory.
         *
         * @default 'snap.manifest.json'
         */
        path?: string;
        /**
         * Whether to automatically update the manifest. If `true`, the manifest
         * will be updated with the latest shasum of the snap bundle, and some
         * common fields will be updated if they are missing or incorrect. If
         * `false`, the manifest will be left as-is.
         *
         * @default true
         */
        update?: boolean;
    };
    server?: {
        /**
         * Whether to enable the local server. If `true`, the snap will be served
         * from a local server, when running the `watch` command. If `false`, the
         * snap will not be served.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * The root directory to serve the snap from. If the path is relative, it
         * will be resolved relative to the current working directory.
         *
         * @default `process.cwd()`
         */
        root?: string;
        /**
         * The port to run the server on.
         *
         * @default 8081
         */
        port?: number;
    };
    /**
     * The environment variables to set when building the snap. These will be
     * available in the snap as `process.env`. In addition to these environment
     * variables, the following environment variables will always be set:
     *
     * - `NODE_DEBUG`: `false`
     * - `NODE_ENV`: `'production'`
     * - `DEBUG`: `false`
     *
     * Any environment variables specified here will override these defaults. You
     * can also override any variables here by setting them in your shell when
     * running the CLI.
     */
    environment?: Record<string, unknown>;
    /**
     * Options that control the logging output of the CLI.
     */
    stats?: {
        /**
         * Whether to enable verbose logging.
         *
         * @default false
         */
        verbose?: boolean;
        /**
         * Whether to log warnings about unresolved built-in modules. If `false`,
         * warnings will not be logged.
         */
        builtIns?: {
            /**
             * The built-in modules to ignore when resolving modules. If a module
             * is ignored, no warning will be logged if it is not resolved.
             */
            ignore?: string[];
        } | false;
        /**
         * Whether to log warnings about the use of the `Buffer` global. If `false`,
         * warnings will not be logged. If `true`, the CLI will warn if the `Buffer`
         * global is used, but not provided by Webpack's `DefinePlugin`.
         */
        buffer?: boolean;
    };
    /**
     * Whether to provide polyfills for node builtins. If `true`, all the available
     * polyfills will be provided. If `false` no polyfills will be provided. If a
     * configuration object is passed only the polyfills set to `true` will be provided.
     *
     * @default false
     * @example
     * ```ts
     * polyfills: true
     *
     * // or
     *
     * polyfills: {
     *  assert: true,
     *  buffer: true
     * }
     * ```
     */
    polyfills?: boolean | {
        assert?: boolean;
        buffer?: boolean;
        console?: boolean;
        constants?: boolean;
        crypto?: boolean;
        domain?: boolean;
        events?: boolean;
        http?: boolean;
        https?: boolean;
        os?: boolean;
        path?: boolean;
        punycode?: boolean;
        process?: boolean;
        querystring?: boolean;
        stream?: boolean;
        _stream_duplex?: boolean;
        _stream_passthrough?: boolean;
        _stream_readable?: boolean;
        _stream_transform?: boolean;
        _stream_writable?: boolean;
        string_decoder?: boolean;
        sys?: boolean;
        timers?: boolean;
        tty?: boolean;
        url?: boolean;
        util?: boolean;
        vm?: boolean;
        zlib?: boolean;
    };
    /**
     * Optional features to enable in the CLI.
     *
     * @example
     * {
     *   features: {
     *     images: true,
     *   }
     * }
     */
    features?: {
        /**
         * Whether to enable support for images. If `true`, the Webpack
         * configuration will be modified to support images. If `false`, the
         * Webpack configuration will not be modified.
         *
         * @default true
         */
        images?: boolean;
    };
    /**
     * A function to customize the Webpack configuration used to build the snap.
     * This function will be called with the default Webpack configuration, and
     * should return the modified configuration. If not specified, the default
     * configuration will be used.
     *
     * It's recommended to use the `webpack-merge` package to merge the default
     * configuration with your customizations. The merge function is exported as
     * `merge` from the `@metamask/snaps-cli` package.
     *
     * @example
     * ```ts
     * import type { SnapsConfig } from '@metamask/snaps-cli';
     * import { merge } from '@metamask/snaps-cli';
     *
     * const config: SnapsConfig = {
     *   bundler: 'webpack',
     *   entry: 'src/index.ts',
     *   customizeWebpackConfig: (config) => merge(config, {
     *     module: {
     *       rules: [
     *         {
     *           test: /\.wasm$/,
     *           type: 'assets/resource',
     *         },
     *       ],
     *     },
     *   }),
     * };
     *
     * export default config;
     * ```
     */
    customizeWebpackConfig?: (config: WebpackConfiguration) => WebpackConfiguration;
    /**
     * Experimental features that can be enabled. These features are not
     * guaranteed to be stable, and may be removed or changed in a future release.
     */
    experimental?: {
        /**
         * Whether to enable WebAssembly support. If `true`, the Webpack
         * configuration will be modified to support WebAssembly. If `false`, the
         * Webpack configuration will not be modified.
         *
         * @default false
         */
        wasm?: boolean;
    };
};
/**
 * The configuration for the Snaps CLI, stored as `snap.config.js` or
 * `snap.config.ts` in the root of the project.
 */
export declare type SnapConfig = SnapBrowserifyConfig | SnapWebpackConfig;
declare type SnapsBrowserifyBundlerCustomizerFunction = (bundler: BrowserifyObject) => void;
export declare const SnapsBrowserifyConfigStruct: import("@metamask/superstruct").Struct<{
    bundler: "browserify";
    cliOptions: {
        port: number;
        dist: string;
        eval: boolean;
        manifest: boolean;
        outfileName: string;
        root: string;
        sourceMaps: boolean;
        src: string;
        stripComments: boolean;
        suppressWarnings: boolean;
        transpilationMode: "none" | "localAndDeps" | "localOnly";
        depsToTranspile: string[];
        verboseErrors: boolean;
        writeManifest: boolean;
        serve: boolean;
        bundle?: string | undefined;
    };
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
}, {
    bundler: import("@metamask/superstruct").Struct<"browserify", null>;
    cliOptions: import("@metamask/superstruct").Struct<{
        port: number;
        dist: string;
        eval: boolean;
        manifest: boolean;
        outfileName: string;
        root: string;
        sourceMaps: boolean;
        src: string;
        stripComments: boolean;
        suppressWarnings: boolean;
        transpilationMode: "none" | "localAndDeps" | "localOnly";
        depsToTranspile: string[];
        verboseErrors: boolean;
        writeManifest: boolean;
        serve: boolean;
        bundle?: string | undefined;
    }, {
        bundle: import("@metamask/superstruct").Struct<string | undefined, null>;
        dist: import("@metamask/superstruct").Struct<string, null>;
        eval: import("@metamask/superstruct").Struct<boolean, null>;
        manifest: import("@metamask/superstruct").Struct<boolean, null>;
        port: import("@metamask/superstruct").Struct<number, null>;
        outfileName: import("@metamask/superstruct").Struct<string, null>;
        root: import("@metamask/superstruct").Struct<string, null>;
        sourceMaps: import("@metamask/superstruct").Struct<boolean, null>;
        src: import("@metamask/superstruct").Struct<string, null>;
        stripComments: import("@metamask/superstruct").Struct<boolean, null>;
        suppressWarnings: import("@metamask/superstruct").Struct<boolean, null>;
        transpilationMode: import("@metamask/superstruct").Struct<"none" | "localAndDeps" | "localOnly", [import("@metamask/superstruct").Struct<"localAndDeps", null>, import("@metamask/superstruct").Struct<"localOnly", null>, import("@metamask/superstruct").Struct<"none", null>]>;
        depsToTranspile: import("@metamask/superstruct").Struct<string[], import("@metamask/superstruct").Struct<string, null>>;
        verboseErrors: import("@metamask/superstruct").Struct<boolean, null>;
        writeManifest: import("@metamask/superstruct").Struct<boolean, null>;
        serve: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
    bundlerCustomizer: import("@metamask/superstruct").Struct<SnapsBrowserifyBundlerCustomizerFunction | undefined, null>;
}>;
declare type SnapsWebpackCustomizeWebpackConfigFunction = (config: WebpackConfiguration) => WebpackConfiguration;
export declare const SnapsWebpackConfigStruct: import("@metamask/superstruct").Struct<{
    input: string;
    server: {
        port: number;
        root: string;
        enabled: boolean;
    };
    manifest: {
        path: string;
        update: boolean;
    };
    sourceMap: boolean | "inline";
    bundler: "webpack";
    evaluate: boolean;
    output: {
        path: string;
        filename: string;
        minimize: boolean;
        clean: boolean;
    };
    environment: Record<string, unknown>;
    stats: {
        buffer: boolean;
        verbose: boolean;
        builtIns: false | {
            ignore: string[];
        };
    };
    polyfills: boolean | {
        path: boolean;
        assert: boolean;
        buffer: boolean;
        stream: boolean;
        http: boolean;
        zlib: boolean;
        url: boolean;
        https: boolean;
        console: boolean;
        constants: boolean;
        crypto: boolean;
        domain: boolean;
        events: boolean;
        os: boolean;
        punycode: boolean;
        process: boolean;
        querystring: boolean;
        _stream_duplex: boolean;
        _stream_passthrough: boolean;
        _stream_readable: boolean;
        _stream_transform: boolean;
        _stream_writable: boolean;
        string_decoder: boolean;
        sys: boolean;
        timers: boolean;
        tty: boolean;
        util: boolean;
        vm: boolean;
    };
    features: {
        images: boolean;
    };
    experimental: {
        wasm: boolean;
    };
    customizeWebpackConfig?: SnapsWebpackCustomizeWebpackConfigFunction | undefined;
}, {
    bundler: import("@metamask/superstruct").Struct<"webpack", null>;
    input: import("@metamask/superstruct").Struct<string, null>;
    sourceMap: import("@metamask/superstruct").Struct<boolean | "inline", [import("@metamask/superstruct").Struct<boolean, null>, import("@metamask/superstruct").Struct<"inline", null>]>;
    evaluate: import("@metamask/superstruct").Struct<boolean, null>;
    output: import("@metamask/superstruct").Struct<{
        path: string;
        filename: string;
        minimize: boolean;
        clean: boolean;
    }, {
        path: import("@metamask/superstruct").Struct<string, null>;
        filename: import("@metamask/superstruct").Struct<string, null>;
        clean: import("@metamask/superstruct").Struct<boolean, null>;
        minimize: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
    manifest: import("@metamask/superstruct").Struct<{
        path: string;
        update: boolean;
    }, {
        path: import("@metamask/superstruct").Struct<string, null>;
        update: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
    server: import("@metamask/superstruct").Struct<{
        port: number;
        root: string;
        enabled: boolean;
    }, {
        enabled: import("@metamask/superstruct").Struct<boolean, null>;
        root: import("@metamask/superstruct").Struct<string, null>;
        port: import("@metamask/superstruct").Struct<number, null>;
    }>;
    environment: import("@metamask/superstruct").Struct<Record<string, unknown>, null>;
    stats: import("@metamask/superstruct").Struct<{
        buffer: boolean;
        verbose: boolean;
        builtIns: false | {
            ignore: string[];
        };
    }, {
        verbose: import("@metamask/superstruct").Struct<boolean, null>;
        builtIns: import("@metamask/superstruct").Struct<false | {
            ignore: string[];
        }, [import("@metamask/superstruct").Struct<{
            ignore: string[];
        }, {
            ignore: import("@metamask/superstruct").Struct<string[], import("@metamask/superstruct").Struct<string, null>>;
        }>, import("@metamask/superstruct").Struct<false, null>]>;
        buffer: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
    polyfills: import("@metamask/superstruct").Struct<boolean | {
        path: boolean;
        assert: boolean;
        buffer: boolean;
        stream: boolean;
        http: boolean;
        zlib: boolean;
        url: boolean;
        https: boolean;
        console: boolean;
        constants: boolean;
        crypto: boolean;
        domain: boolean;
        events: boolean;
        os: boolean;
        punycode: boolean;
        process: boolean;
        querystring: boolean;
        _stream_duplex: boolean;
        _stream_passthrough: boolean;
        _stream_readable: boolean;
        _stream_transform: boolean;
        _stream_writable: boolean;
        string_decoder: boolean;
        sys: boolean;
        timers: boolean;
        tty: boolean;
        util: boolean;
        vm: boolean;
    }, [import("@metamask/superstruct").Struct<boolean, null>, import("@metamask/superstruct").Struct<{
        path: boolean;
        assert: boolean;
        buffer: boolean;
        stream: boolean;
        http: boolean;
        zlib: boolean;
        url: boolean;
        https: boolean;
        console: boolean;
        constants: boolean;
        crypto: boolean;
        domain: boolean;
        events: boolean;
        os: boolean;
        punycode: boolean;
        process: boolean;
        querystring: boolean;
        _stream_duplex: boolean;
        _stream_passthrough: boolean;
        _stream_readable: boolean;
        _stream_transform: boolean;
        _stream_writable: boolean;
        string_decoder: boolean;
        sys: boolean;
        timers: boolean;
        tty: boolean;
        util: boolean;
        vm: boolean;
    }, {
        assert: import("@metamask/superstruct").Struct<boolean, null>;
        buffer: import("@metamask/superstruct").Struct<boolean, null>;
        console: import("@metamask/superstruct").Struct<boolean, null>;
        constants: import("@metamask/superstruct").Struct<boolean, null>;
        crypto: import("@metamask/superstruct").Struct<boolean, null>;
        domain: import("@metamask/superstruct").Struct<boolean, null>;
        events: import("@metamask/superstruct").Struct<boolean, null>;
        http: import("@metamask/superstruct").Struct<boolean, null>;
        https: import("@metamask/superstruct").Struct<boolean, null>;
        os: import("@metamask/superstruct").Struct<boolean, null>;
        path: import("@metamask/superstruct").Struct<boolean, null>;
        punycode: import("@metamask/superstruct").Struct<boolean, null>;
        process: import("@metamask/superstruct").Struct<boolean, null>;
        querystring: import("@metamask/superstruct").Struct<boolean, null>;
        stream: import("@metamask/superstruct").Struct<boolean, null>;
        _stream_duplex: import("@metamask/superstruct").Struct<boolean, null>;
        _stream_passthrough: import("@metamask/superstruct").Struct<boolean, null>;
        _stream_readable: import("@metamask/superstruct").Struct<boolean, null>;
        _stream_transform: import("@metamask/superstruct").Struct<boolean, null>;
        _stream_writable: import("@metamask/superstruct").Struct<boolean, null>;
        string_decoder: import("@metamask/superstruct").Struct<boolean, null>;
        sys: import("@metamask/superstruct").Struct<boolean, null>;
        timers: import("@metamask/superstruct").Struct<boolean, null>;
        tty: import("@metamask/superstruct").Struct<boolean, null>;
        url: import("@metamask/superstruct").Struct<boolean, null>;
        util: import("@metamask/superstruct").Struct<boolean, null>;
        vm: import("@metamask/superstruct").Struct<boolean, null>;
        zlib: import("@metamask/superstruct").Struct<boolean, null>;
    }>]>;
    features: import("@metamask/superstruct").Struct<{
        images: boolean;
    }, {
        images: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
    customizeWebpackConfig: import("@metamask/superstruct").Struct<SnapsWebpackCustomizeWebpackConfigFunction | undefined, null>;
    experimental: import("@metamask/superstruct").Struct<{
        wasm: boolean;
    }, {
        wasm: import("@metamask/superstruct").Struct<boolean, null>;
    }>;
}>;
export declare const SnapsConfigStruct: import("@metamask/superstruct").Struct<{
    bundler: "browserify" | "webpack";
}, {
    bundler: import("@metamask/superstruct").Struct<"browserify" | "webpack", [import("@metamask/superstruct").Struct<"browserify", null>, import("@metamask/superstruct").Struct<"webpack", null>]>;
}>;
export declare const LegacyOptionsStruct: import("@metamask/superstruct").Struct<{
    transpilationMode: TranspilationModes.LocalAndDeps;
    depsToTranspile: string[];
    writeManifest: boolean;
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
} | {
    transpilationMode: TranspilationModes.LocalOnly | TranspilationModes.None;
    depsToTranspile: unknown[];
    writeManifest: boolean;
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
}, [import("@metamask/superstruct").Struct<{
    transpilationMode: TranspilationModes.LocalAndDeps;
    depsToTranspile: string[];
    writeManifest: boolean;
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
}, {
    depsToTranspile: import("@metamask/superstruct").Struct<string[], import("@metamask/superstruct").Struct<string, null>>;
    transpilationMode: import("@metamask/superstruct").Struct<TranspilationModes.LocalAndDeps, null>;
    writeManifest: import("@metamask/superstruct").Struct<boolean, null>;
    bundlerCustomizer: import("@metamask/superstruct").Struct<SnapsBrowserifyBundlerCustomizerFunction | undefined, null>;
}>, import("@metamask/superstruct").Struct<{
    transpilationMode: TranspilationModes.LocalOnly | TranspilationModes.None;
    depsToTranspile: unknown[];
    writeManifest: boolean;
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
}, {
    depsToTranspile: import("@metamask/superstruct").Struct<unknown[], undefined>;
    transpilationMode: import("@metamask/superstruct").Struct<TranspilationModes.LocalOnly | TranspilationModes.None, [import("@metamask/superstruct").Struct<TranspilationModes.LocalOnly, null>, import("@metamask/superstruct").Struct<TranspilationModes.None, null>]>;
    writeManifest: import("@metamask/superstruct").Struct<boolean, null>;
    bundlerCustomizer: import("@metamask/superstruct").Struct<SnapsBrowserifyBundlerCustomizerFunction | undefined, null>;
}>]>;
export declare type LegacyOptions = Infer<typeof LegacyOptionsStruct>;
export declare type ProcessedBrowserifyConfig = Infer<typeof SnapsBrowserifyConfigStruct>;
export declare type ProcessedWebpackConfig = Infer<typeof SnapsWebpackConfigStruct> & {
    /**
     * The legacy Browserify config, if the bundler is Browserify. This is used
     * to support the legacy config format.
     */
    legacy?: LegacyOptions;
};
export declare type ProcessedConfig = ProcessedWebpackConfig;
/**
 * Get a validated snap config. This validates the config and adds default
 * values for any missing properties.
 *
 * @param config - The config to validate.
 * @param argv - The CLI arguments.
 * @returns The validated config.
 */
export declare function getConfig(config: unknown, argv: YargsArgs): ProcessedConfig;
/**
 * Load a snap config from a file. This supports both JavaScript and TypeScript
 * config files, in the CommonJS module format and the ES module format.
 *
 * This assumes that the config file exports a default object, either through
 * `module.exports` or `export default`.
 *
 * @param path - The full path to the config file.
 * @param argv - The CLI arguments.
 * @returns The validated config.
 * @throws If the config file is invalid, or if the config file does not have a
 * default export.
 */
export declare function loadConfig(path: string, argv: YargsArgs): Promise<ProcessedWebpackConfig>;
/**
 * Resolve a snap config. This function will look for a `snap.config.js` or
 * `snap.config.ts` file in the current or specified directory.
 *
 * @param path - The path to resolve the snap config from. Defaults to the
 * current working directory.
 * @param argv - The CLI arguments.
 * @returns The resolved and validated snap config.
 * @throws If a snap config could not be found.
 */
export declare function resolveConfig(path: string, argv: YargsArgs): Promise<ProcessedWebpackConfig>;
/**
 * Get a snap config from the CLI arguments. This will either load the config
 * from the specified config file, or resolve the config from the current
 * working directory.
 *
 * @param argv - The CLI arguments.
 * @param cwd - The current working directory. Defaults to `process.cwd()`.
 * @returns The resolved and validated snap config.
 */
export declare function getConfigByArgv(argv: YargsArgs, cwd?: string): Promise<ProcessedWebpackConfig>;
/**
 * Merge legacy CLI options into the config. This is used to support the legacy
 * config format, where options can be specified both in the config file and
 * through CLI flags.
 *
 * @param argv - The CLI arguments.
 * @param config - The config to merge the CLI options into.
 * @returns The config with the CLI options merged in.
 * @deprecated This function is only used to support the legacy config format.
 */
export declare function mergeLegacyOptions(argv: YargsArgs, config: ProcessedBrowserifyConfig): {
    cliOptions: {
        port: number;
        dist: string;
        eval: boolean;
        manifest: boolean;
        outfileName: string;
        root: string;
        sourceMaps: boolean;
        src: string;
        stripComments: boolean;
        suppressWarnings: boolean;
        transpilationMode: "none" | "localAndDeps" | "localOnly";
        depsToTranspile: string[];
        verboseErrors: boolean;
        writeManifest: boolean;
        serve: boolean;
        bundle?: string | undefined;
    };
    bundler: "browserify";
    bundlerCustomizer?: SnapsBrowserifyBundlerCustomizerFunction | undefined;
};
/**
 * Get a Webpack config from a legacy browserify config. This is used to
 * support the legacy config format, and convert it to the new format.
 *
 * @param legacyConfig - The legacy browserify config.
 * @returns The Webpack config.
 */
export declare function getWebpackConfig(legacyConfig: ProcessedBrowserifyConfig): ProcessedWebpackConfig;
export {};
