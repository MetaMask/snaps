import { logError } from '@metamask/snaps-utils';
import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import { hasProperty, isPlainObject } from '@metamask/utils';
import type { IFs } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import { promisify } from 'util';
import type { Configuration, StatsCompilation } from 'webpack';
import webpack from 'webpack';

export type CompileOptions = {
  code?: string;
  fileSystem?: IFs;
  config?: Configuration;
  watchMode?: boolean;
};

/**
 * Compile a snap bundle using webpack.
 *
 * @param options - Options to configure the compilation.
 * @param options.code - The snap bundle code.
 * @param options.fileSystem - The file system to use. Defaults to an in-memory
 * file system.
 * @param options.config - The webpack configuration to use. Defaults to a
 * minimal configuration that compiles the provided code.
 * @param options.watchMode - Whether to compile in watch mode. Defaults to
 * false.
 * @returns The compiled code.
 */
export async function getCompiler({
  code = DEFAULT_SNAP_BUNDLE,
  fileSystem = createFsFromVolume(new Volume()),
  config,
  watchMode = false,
}: CompileOptions = {}) {
  await fileSystem.promises.writeFile('/input.js', code);

  const compiler = webpack({
    entry: '/input.js',
    mode: 'none',
    output: {
      path: '/',
      filename: 'output.js',
    },
    ...config,
  });

  compiler.watchMode = watchMode;
  compiler.inputFileSystem = fileSystem;
  compiler.outputFileSystem = fileSystem;

  return compiler;
}

/**
 * Compile a snap bundle using webpack.
 *
 * @param options - Options to configure the compilation.
 * @param options.code - The snap bundle code.
 * @param options.fileSystem - The file system to use. Defaults to an in-memory
 * file system.
 * @param options.config - The webpack configuration to use. Defaults to a
 * minimal configuration that compiles the provided code.
 * @returns The compiled code.
 */
export async function compile(
  options: CompileOptions,
): Promise<{ code: string; stats: StatsCompilation }> {
  const compiler = await getCompiler(options);

  return new Promise((resolve, reject) => {
    compiler.run(async (error, stats) => {
      if (error || !stats) {
        reject(new Error('Failed to compile.'));
        return;
      }

      if (stats.hasErrors()) {
        logError(stats.toString('errors-only'));
        reject(new Error('Failed to compile.'));
        return;
      }

      const output = (await promisify(compiler.outputFileSystem.readFile)(
        '/output.js',
      )) as string;

      resolve({
        code: output,
        stats: stats.toJson(),
      });
    });
  });
}

/**
 * Normalize the configuration to make the snapshots deterministic. This will:
 *
 * - Fake the fallback modules path to ensure that snapshots have the same path
 * on different systems.
 * - Change the `loader` path to ensure that snapshots have the same path on
 * different systems.
 *
 * @param config - The webpack configuration.
 * @returns The webpack configuration with the fallback paths normalized.
 */
export function normalizeConfig(config: Configuration): Configuration {
  if (!config.resolve?.fallback || !config.module?.rules) {
    return config;
  }

  const {
    module: { rules },
    resolve: { fallback, ...resolveRest },
    ...rest
  } = config;

  const normalizedRules = rules.map((rule) => {
    if (
      !isPlainObject(rule) ||
      !isPlainObject(rule.use) ||
      !hasProperty(rule.use, 'loader') ||
      typeof rule.use.loader !== 'string'
    ) {
      return rule;
    }

    if (rule.use.loader.includes('swc-loader')) {
      return {
        ...rule,
        use: {
          ...rule.use,
          loader: '/foo/bar/node_modules/swc-loader/index.js',
        },
      };
    }

    if (rule.use.loader.includes('function.ts')) {
      return {
        ...rule,
        use: {
          ...rule.use,
          loader: '/foo/bar/src/webpack/loaders/function.ts',
        },
      };
    }

    return rule;
  });

  const normalizedFallbacks = Object.keys(fallback).reduce((acc, index) => {
    if (typeof (fallback as Record<string, string>)[index] === 'string') {
      return { [index]: '/foo/bar/index.js', ...acc };
    }

    return { [index]: (fallback as Record<string, string>)[index], ...acc };
  }, {});

  return {
    ...rest,
    module: { ...config.module, rules: normalizedRules },
    resolve: { ...resolveRest, fallback: normalizedFallbacks },
  };
}
