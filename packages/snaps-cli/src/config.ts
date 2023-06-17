import { createFromStruct, isFile, literal } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';
import { transform } from '@swc/core';
import type { BrowserifyObject } from 'browserify';
import { readFile } from 'fs/promises';
import Module from 'module';
import { dirname, resolve } from 'path';
import {
  boolean,
  defaulted,
  define,
  func,
  number,
  object,
  optional,
  string,
  type,
  union,
} from 'superstruct';
import type { Configuration as WebpackConfiguration } from 'webpack';

const CONFIG_FILES = ['snap.config.js', 'snap.config.ts'];

/**
 * The configuration for the Snaps CLI, stored as `snap.config.js` or
 * `snap.config.ts` in the root of the project.
 *
 * @deprecated The Browserify bundler is deprecated and will be removed in a
 * future release. Use the Webpack bundler instead.
 */
export type SnapsBrowserifyConfig = {
  /**
   * The bundler to use to build the snap. For backwards compatibility, if not
   * specified, Browserify will be used. However, the Browserify bundler is
   * deprecated and will be removed in a future release, so it's recommended to
   * use the Webpack bundler instead.
   */
  bundler?: 'browserify';

  /**
   * The options for the Snaps CLI.
   *
   * @deprecated The Browserify bundler is deprecated and will be removed in a
   * future release. Use the Webpack bundler instead.
   */
  cliOptions: {
    /**
     * The path to the snap entry point.
     */
    src: string;

    /**
     * The port to run the server on.
     */
    port?: number;
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
export type SnapsWebpackConfig = {
  /**
   * The bundler to use to build the snap. For backwards compatibility, if not
   * specified, Browserify will be used. However, the Browserify bundler is
   * deprecated and will be removed in a future release, so it's recommended to
   * use the Webpack bundler instead.
   */
  bundler: 'webpack';

  /**
   * The path to the snap entry point. This can be a JavaScript or TypeScript
   * file.
   */
  entry: string;

  /**
   * Whether to generate source maps for the snap. If `true`, source maps will
   * be generated as separate files. If `'inline'`, source maps will be
   * inlined in the generated JavaScript bundle.
   *
   * @default true
   */
  sourceMap?: boolean | 'inline';

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
  customizeWebpackConfig?: (
    config: WebpackConfiguration,
  ) => WebpackConfiguration;

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
export type SnapConfig = SnapsBrowserifyConfig | SnapsWebpackConfig;

type SnapsBrowserifyBundlerCustomizerFunction = (
  bundler: BrowserifyObject,
) => void;

// This struct is essentially the same as the `func` struct, but it's defined
// separately so that we include the function type in the inferred TypeScript
// type definitions.
const SnapsBrowserifyBundlerCustomizerFunctionStruct =
  define<SnapsBrowserifyBundlerCustomizerFunction>(
    'function',
    func().validator,
  );

export const SnapsBrowserifyConfigStruct = object({
  bundler: defaulted(literal('browserify'), 'browserify'),
  cliOptions: defaulted(
    object({
      src: defaulted(string(), 'src/index.js'),
      port: defaulted(number(), 8000),
    }),
    {},
  ),
  bundlerCustomizer: optional(SnapsBrowserifyBundlerCustomizerFunctionStruct),
});

type SnapsWebpackCustomizeWebpackConfigFunction = (
  config: WebpackConfiguration,
) => WebpackConfiguration;

// This struct is essentially the same as the `func` struct, but it's defined
// separately so that we include the function type in the inferred TypeScript
// type definitions.
const SnapsWebpackCustomizeWebpackConfigFunctionStruct =
  define<SnapsWebpackCustomizeWebpackConfigFunction>(
    'function',
    func().validator,
  );

export const SnapsWebpackConfigStruct = object({
  bundler: literal('webpack'),
  entry: string(),
  sourceMap: defaulted(union([boolean(), literal('inline')]), true),
  output: defaulted(
    object({
      path: defaulted(string(), 'dist'),
      filename: defaulted(string(), 'bundle.js'),
      clean: defaulted(boolean(), false),
    }),
    {},
  ),
  customizeWebpackConfig: optional(
    SnapsWebpackCustomizeWebpackConfigFunctionStruct,
  ),
  experimental: defaulted(
    object({
      wasm: defaulted(boolean(), false),
    }),
    {},
  ),
});

export const SnapsConfigStruct = type({
  bundler: defaulted(
    union([literal('browserify'), literal('webpack')]),
    'browserify',
  ),
});

/**
 * Get a validated snap config. This validates the config and adds default
 * values for any missing properties.
 *
 * @param config - The config to validate.
 * @returns The validated config.
 */
export function getConfig(config: unknown): SnapConfig {
  const suffix =
    'Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/';

  const { bundler } = createFromStruct(
    config,
    SnapsConfigStruct,
    'Invalid snap config',
    suffix,
  );

  if (bundler === 'browserify') {
    return createFromStruct(
      config,
      SnapsBrowserifyConfigStruct,
      'Invalid snap config (Browserify)',
      suffix,
    );
  }

  return createFromStruct(
    config,
    SnapsWebpackConfigStruct,
    'Invalid snap config (Webpack)',
    suffix,
  );
}

/**
 * Load a snap config from a file. This supports both JavaScript and TypeScript
 * config files, in the CommonJS module format and the ES module format.
 *
 * This assumes that the config file exports a default object, either through
 * `module.exports` or `export default`.
 *
 * @param path - The full path to the config file.
 * @returns The validated config.
 * @throws If the config file is invalid, or if the config file does not have a
 * default export.
 */
export async function loadConfig(path: string) {
  const contents = await readFile(path, 'utf8');
  const source = await transform(contents, {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
    },
    module: {
      type: 'commonjs',
    },
  });

  const config = new Module(path);

  // @ts-expect-error - This function is not typed.
  config.paths = Module._nodeModulePaths(dirname(path));

  // @ts-expect-error - This function is not typed.
  config._compile(source.code, path);

  if (!hasProperty(config.exports, 'default')) {
    return getConfig(config.exports);
  }

  return getConfig(config.exports.default);
}

/**
 * Resolve a snap config. This function will look for a `snap.config.js` or
 * `snap.config.ts` file in the current or specified directory.
 *
 * @param path - The path to resolve the snap config from. Defaults to the
 * current working directory.
 * @returns The resolved and validated snap config.
 * @throws If a snap config could not be found.
 */
export async function resolveConfig(path = resolve(process.cwd())) {
  for (const file of CONFIG_FILES) {
    const filePath = resolve(path, file);
    if (await isFile(filePath)) {
      return await loadConfig(filePath);
    }
  }

  throw new Error(
    `Could not find a "snap.config.js" or "snap.config.ts" file in the current or specified directory ("${path}").`,
  );
}
