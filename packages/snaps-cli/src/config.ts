import { createFromStruct, isFile, literal } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';
import { transform } from '@swc/core';
import type { BrowserifyObject } from 'browserify';
import { readFile } from 'fs/promises';
import Module from 'module';
import { dirname, resolve } from 'path';
import {
  array,
  boolean,
  defaulted,
  define,
  func,
  Infer,
  number,
  object,
  optional,
  string,
  type,
  union,
} from 'superstruct';
import type { Configuration as WebpackConfiguration } from 'webpack';

import { YargsArgs } from './types/yargs';

const CONFIG_FILES = ['snap.config.js', 'snap.config.ts'];

/**
 * The configuration for the Snaps CLI, stored as `snap.config.js` or
 * `snap.config.ts` in the root of the project.
 *
 * @deprecated The Browserify bundler is deprecated and will be removed in a
 * future release. Use the Webpack bundler instead.
 */
export type SnapBrowserifyConfig = {
  /**
   * The bundler to use to build the snap. For backwards compatibility, if not
   * specified, Browserify will be used. However, the Browserify bundler is
   * deprecated and will be removed in a future release, so it's recommended to
   * use the Webpack bundler instead.
   */
  bundler?: 'browserify';

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
     * The directory to output the snap to.
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
     * The name of the bundle file.
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
export type SnapWebpackConfig = {
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
export type SnapConfig = SnapBrowserifyConfig | SnapWebpackConfig;

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
      bundle: defaulted(string(), 'dist/bundle.js'),
      dist: defaulted(string(), 'dist'),
      eval: defaulted(boolean(), true),
      manifest: defaulted(boolean(), true),
      port: defaulted(number(), 8081),
      outfileName: defaulted(string(), 'bundle.js'),
      root: defaulted(string(), process.cwd()),
      sourceMaps: defaulted(boolean(), false),
      src: defaulted(string(), 'src/index.js'),
      stripComments: defaulted(boolean(), true),
      suppressWarnings: defaulted(boolean(), false),
      transpilationMode: defaulted(
        union([literal('localAndDeps'), literal('localOnly'), literal('none')]),
        'localOnly',
      ),
      depsToTranspile: defaulted(array(string()), []),
      verboseErrors: defaulted(boolean(), true),
      writeManifest: defaulted(boolean(), true),
      serve: defaulted(boolean(), true),
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
  evaluate: defaulted(boolean(), true),

  output: defaulted(
    object({
      path: defaulted(string(), resolve(process.cwd(), 'dist')),
      filename: defaulted(string(), 'bundle.js'),
      clean: defaulted(boolean(), false),
    }),
    {},
  ),

  manifest: defaulted(
    object({
      path: defaulted(string(), resolve(process.cwd(), 'snap.manifest.json')),
      update: defaulted(boolean(), true),
    }),
    {},
  ),

  server: defaulted(
    object({
      root: defaulted(string(), process.cwd()),
      port: defaulted(number(), 8081),
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

export type ProcessedBrowserifyConfig = Infer<
  typeof SnapsBrowserifyConfigStruct
>;

export type ProcessedWebpackConfig = Infer<typeof SnapsWebpackConfigStruct>;

export type ProcessedConfig =
  | ProcessedBrowserifyConfig
  | ProcessedWebpackConfig;

/**
 * Get a validated snap config. This validates the config and adds default
 * values for any missing properties.
 *
 * @param config - The config to validate.
 * @returns The validated config.
 */
export function getConfig(config: unknown): ProcessedConfig {
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

/**
 * Get a snap config from the CLI arguments. This will either load the config
 * from the specified config file, or resolve the config from the current
 * working directory.
 *
 * @param argv - The CLI arguments.
 * @returns The resolved and validated snap config.
 */
export async function getConfigByArgv(argv: YargsArgs) {
  if (argv.config) {
    return mergeLegacyOptions(argv, await loadConfig(argv.config));
  }

  return mergeLegacyOptions(argv, await resolveConfig(process.cwd()));
}

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
export function mergeLegacyOptions(argv: YargsArgs, config: ProcessedConfig) {
  if (config.bundler === 'webpack') {
    return config;
  }

  const cliOptions = Object.keys(config.cliOptions).reduce<
    ProcessedBrowserifyConfig['cliOptions']
  >((accumulator, key) => {
    if (argv[key]) {
      return {
        ...accumulator,
        [key]: argv[key],
      };
    }

    return accumulator;
  }, config.cliOptions);

  return {
    ...config,
    cliOptions,
  };
}
