import type { Options } from '@metamask/snaps-browserify-plugin';
import plugin from '@metamask/snaps-browserify-plugin';
import browserify from 'browserify';

import { TranspilationModes } from '../../../builders';
import type { ProcessedBrowserifyConfig } from '../../../config';
import { processDependencies, writeBundleFile } from './utils';

// We need to statically import all Browserify transforms and all Babel presets
// and plugins, and calling `require` is the sanest way to do that.
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, n/global-require */

/**
 * Builds a Snap bundle JS file from its JavaScript source.
 *
 * @param config - Processed CLI configuration.
 * @param config.sourceMaps - Whether to output sourcemaps.
 * @param config.stripComments - Whether to remove comments from code.
 * @param config.transpilationMode - The Babel transpilation mode.
 * the Browserify instance, e.g., adding a custom transform or plugin.
 */
export async function bundle(
  config: ProcessedBrowserifyConfig,
): Promise<boolean> {
  const {
    bundlerCustomizer,
    cliOptions: { src, sourceMaps: debug, transpilationMode },
  } = config;

  const babelifyOptions = processDependencies(config);
  return new Promise((resolve, _reject) => {
    const bundler = browserify(src, {
      debug,
      extensions: ['.js', '.ts'],
      // Standalone is required to properly support Snaps using module.exports
      standalone: '<snap>',
    });

    if (transpilationMode !== TranspilationModes.None) {
      bundler.transform(require('babelify'), {
        global: transpilationMode === TranspilationModes.LocalAndDeps,
        extensions: ['.js', '.ts'],
        presets: [
          require('@babel/preset-typescript'),
          [
            require('@babel/preset-env'),
            {
              targets: {
                browsers: ['chrome >= 90', 'firefox >= 91'],
              },
            },
          ],
        ],
        plugins: [
          require('@babel/plugin-transform-runtime'),
          require('@babel/plugin-proposal-class-properties'),
          require('@babel/plugin-proposal-private-methods'),
          require('@babel/plugin-proposal-class-static-block'),
          require('@babel/plugin-proposal-private-property-in-object'),
        ],
        parserOpts: {
          attachComment: !config.cliOptions.stripComments,
        },
        ...(babelifyOptions as any),
      });
    }

    bundlerCustomizer?.(bundler);

    bundler.plugin<Options>(plugin, {
      stripComments: config.cliOptions.stripComments,
      manifestPath: undefined,
      eval: false,
    });

    bundler.bundle(async (bundleError, bundleBuffer: Buffer) => {
      await writeBundleFile({
        bundleError,
        bundleBuffer,
        config,
      });

      resolve(true);
    });
  });
}
