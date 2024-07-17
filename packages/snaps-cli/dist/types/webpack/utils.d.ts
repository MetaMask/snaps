/// <reference types="browserify" />
import type { Ora } from 'ora';
import type { Configuration } from 'webpack';
import type { ProcessedWebpackConfig } from '../config';
export declare const BROWSERSLIST_FILE: string;
export declare const WEBPACK_FALLBACKS: {
    assert: string;
    buffer: string;
    console: string;
    constants: string;
    crypto: string;
    domain: string;
    events: string;
    http: string;
    https: string;
    os: string;
    path: string;
    punycode: string;
    process: string;
    querystring: string;
    stream: string;
    _stream_duplex: string;
    _stream_passthrough: string;
    _stream_readable: string;
    _stream_transform: string;
    _stream_writable: string;
    string_decoder: string;
    sys: string;
    timers: string;
    tty: string;
    url: string;
    util: string;
    vm: string;
    zlib: string;
};
/**
 * Get the default loader for JavaScript and TypeScript files, based on the
 * config object.
 *
 * - If the `legacy` option is set, we use the custom `browserify` loader. This
 * uses the legacy Browserify config to transpile the code.
 * - Otherwise, we use the `swc-loader`. This is a Webpack loader that uses the
 * `SWC` compiler, which is a much faster alternative to Babel and TypeScript's
 * own compiler.
 *
 * @param config - The processed snap Webpack config.
 * @param config.legacy - The legacy config object, if any.
 * @param config.sourceMap - Whether to generate source maps.
 * @see https://swc.rs/docs/usage/swc-loader
 * @returns The default loader.
 */
export declare function getDefaultLoader({ legacy, sourceMap, }: ProcessedWebpackConfig): Promise<{
    loader: string;
    options: {
        fn: import("webpack").LoaderDefinitionFunction<{
            transpilationMode: import("../builders").TranspilationModes.LocalAndDeps;
            depsToTranspile: string[];
            writeManifest: boolean;
            bundlerCustomizer?: ((bundler: import("browserify").BrowserifyObject) => void) | undefined;
        } | {
            transpilationMode: import("../builders").TranspilationModes.LocalOnly | import("../builders").TranspilationModes.None;
            depsToTranspile: unknown[];
            writeManifest: boolean;
            bundlerCustomizer?: ((bundler: import("browserify").BrowserifyObject) => void) | undefined;
        }, {}>;
    } & ({
        transpilationMode: import("../builders").TranspilationModes.LocalAndDeps;
        depsToTranspile: string[];
        writeManifest: boolean;
        bundlerCustomizer?: ((bundler: import("browserify").BrowserifyObject) => void) | undefined;
    } | {
        transpilationMode: import("../builders").TranspilationModes.LocalOnly | import("../builders").TranspilationModes.None;
        depsToTranspile: unknown[];
        writeManifest: boolean;
        bundlerCustomizer?: ((bundler: import("browserify").BrowserifyObject) => void) | undefined;
    });
} | {
    /**
     * We use the `swc-loader` to transpile TypeScript and JavaScript files.
     * This is a Webpack loader that uses the `SWC` compiler, which is a much
     * faster alternative to Babel and TypeScript's own compiler.
     */
    loader: string;
    /**
     * The options for the `swc-loader`. These can be overridden in the
     * `.swcrc` file.
     *
     * @see https://swc.rs/docs/configuration/swcrc
     */
    options: {
        sync: boolean;
        /**
         * This tells SWC to generate source maps. We set it to the
         * `sourceMap` value from the config object.
         *
         * This must be enabled if source maps are enabled in the config.
         */
        sourceMaps: boolean;
        jsc: {
            parser: {
                /**
                 * This tells the parser to parse TypeScript files. If you
                 * don't need to support TypeScript, you can set this to
                 * `ecmascript` instead, but there's no harm in leaving it
                 * as `typescript`.
                 *
                 * @see https://swc.rs/docs/configuration/compilation#jscparser
                 */
                syntax: string;
                /**
                 * This tells the parser to transpile JSX.
                 *
                 * @see https://swc.rs/docs/configuration/compilation#jscparser
                 * @see https://swc.rs/docs/configuration/compilation#jscparserjsx
                 */
                tsx: boolean;
            };
            transform: {
                react: {
                    /**
                     * This tells SWC to use the JSX runtime, instead of the
                     * `createElement` function.
                     *
                     * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
                     */
                    runtime: string;
                    /**
                     * This tells SWC to import the JSX runtime from the
                     * `@metamask/snaps-sdk` package, instead of the default React
                     * package.
                     *
                     * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
                     */
                    importSource: string;
                    /**
                     * This tells SWC to use `Object.assign` and `Object.create` for
                     * JSX spread attributes, instead of the default behavior.
                     *
                     * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
                     */
                    useBuiltins: boolean;
                };
            };
        };
        /**
         * The module configuration. This tells SWC how to output the
         * transpiled code.
         *
         * @see https://swc.rs/docs/configuration/modules
         */
        module: {
            /**
             * This tells SWC to output ES6 modules. This will allow Webpack to
             * optimize the output code better. Snaps don't support ES6 however, so
             * the output code will be transpiled to CommonJS by Webpack later in
             * the build process.
             *
             * @see https://swc.rs/docs/configuration/modules#es6
             */
            type: string;
        };
        env: {
            targets: string;
        };
    };
}>;
/**
 * Get the Webpack devtool configuration based on the given snap config.
 *
 * - If `sourceMap` is `inline`, return `inline-source-map`.
 * - If `sourceMap` is `true`, return `source-map`.
 * - Otherwise, return `false`.
 *
 * @param sourceMap - The `sourceMap` value from the snap config.
 * @returns The Webpack devtool configuration.
 */
export declare function getDevTool(sourceMap: ProcessedWebpackConfig['sourceMap']): Configuration['devtool'];
/**
 * Get a function that can be used as handler function for Webpack's
 * `ProgressPlugin`.
 *
 * @param spinner - The spinner to update.
 * @param spinnerText - The initial spinner text. This will be prepended to the
 * percentage.
 * @returns A function that can be used as handler function for Webpack's
 * `ProgressPlugin`.
 */
export declare function getProgressHandler(spinner?: Ora, spinnerText?: string): (percentage: number) => void;
/**
 * Get the targets from the `.browserslistrc` file.
 *
 * @returns The browser targets as an array of strings.
 */
export declare function getBrowserslistTargets(): Promise<string[]>;
/**
 * Get a singular or plural string based on the given count. This is useful for
 * generating messages like "1 error" or "2 errors". By default, the plural
 * string is the singular string with an "s" appended to it.
 *
 * This assumes that the text is in English, and likely won't work for some
 * other languages.
 *
 * @param count - The count.
 * @param singular - The singular string.
 * @param plural - The plural string.
 * @returns The singular or plural string.
 * @example
 * ```typescript
 * pluralize(1, 'error'); // => 'error'
 * pluralize(2, 'error'); // => 'errors'
 * pluralize(1, 'error', 'problem'); // => 'error'
 * pluralize(2, 'error', 'problems'); // => 'problems'
 * ```
 */
export declare function pluralize(count: number, singular: string, plural?: string): string;
/**
 * Get an object that can be used as fallback config for Webpack's
 * `fallback` config.
 *
 * @param polyfills - The polyfill object from the snap config.
 * @returns The webpack fallback config.
 */
export declare function getFallbacks(polyfills: ProcessedWebpackConfig['polyfills']): {
    [index: string]: string | false;
};
/**
 * Get an object that can be used as environment variables for Webpack's
 * `DefinePlugin`.
 *
 * @param environment - The environment object from the Snap config.
 * @param defaults - The default environment variables.
 * @returns The Webpack environment variables.
 */
export declare function getEnvironmentVariables(environment: Record<string, unknown>, defaults?: {
    NODE_DEBUG: string;
    NODE_ENV: string;
    DEBUG: string;
}): {
    [k: string]: string;
};
/**
 * Format the given text to fit within the terminal width.
 *
 * @param text - The text to format.
 * @param indent - The indentation to use.
 * @param initialIndent - The initial indentation to use, i.e., the indentation
 * for the first line.
 * @returns The formatted text.
 */
export declare function formatText(text: string, indent: number, initialIndent?: number): string;
/**
 * Get an SVG from the given bytes and mime type.
 *
 * @param mimeType - The mime type of the image.
 * @param bytes - The image bytes.
 * @returns The SVG.
 */
export declare function getImageSVG(mimeType: string, bytes: Uint8Array): string;
