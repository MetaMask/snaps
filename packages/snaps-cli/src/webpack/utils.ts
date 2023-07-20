import { dim } from 'chalk';
import { promises as fs } from 'fs';
import type { Ora } from 'ora';
import { dirname, resolve } from 'path';
import type { Configuration } from 'webpack';

import type { ProcessedWebpackConfig } from '../config';

export const BROWSERSLIST_FILE = resolve(
  dirname(
    // eslint-disable-next-line n/no-extraneous-require
    require.resolve('@metamask/snaps-cli/package.json'),
  ),
  '.browserslistrc',
);

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
export async function getDefaultLoader({
  legacy,
  sourceMap,
}: ProcessedWebpackConfig) {
  if (legacy) {
    return {
      /**
       * If the snap uses the legacy config, we use the custom `browserify`
       * loader. This uses the legacy Browserify config to transpile the code.
       * This is necessary for backwards compatibility with the
       * `bundlerCustomizer` function.
       */
      loader: resolve(__dirname, 'loaders', 'browserify'),

      /**
       * The options for the `browserify` loader. These can be overridden in the
       * snap config.
       */
      options: legacy,
    };
  }

  const targets = await getBrowserslistTargets();
  return {
    /**
     * We use the `swc-loader` to transpile TypeScript and JavaScript files.
     * This is a Webpack loader that uses the `SWC` compiler, which is a much
     * faster alternative to Babel and TypeScript's own compiler.
     */
    loader: 'swc-loader',

    /**
     * The options for the `swc-loader`. These can be overridden in the
     * `.swcrc` file.
     *
     * @see https://swc.rs/docs/configuration/swcrc
     */
    options: {
      sync: false,

      /**
       * This tells SWC to generate source maps. We set it to the
       * `sourceMap` value from the config object.
       *
       * This must be enabled if source maps are enabled in the config.
       */
      sourceMaps: Boolean(getDevTool(sourceMap)),

      jsc: {
        /**
         * MetaMask targets ES2020, so we set the target to ES2020. This
         * ensures that the code is transpiled to ES2020, and that the
         * necessary polyfills are added.
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

      env: {
        targets: targets.join(', '),
      },
    },
  };
}

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
export function getDevTool(
  sourceMap: ProcessedWebpackConfig['sourceMap'],
): Configuration['devtool'] {
  if (sourceMap === 'inline') {
    return 'inline-source-map';
  }

  if (sourceMap === true) {
    return 'source-map';
  }

  return false;
}

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
// Note: This is extracted for testing purposes.
export function getProgressHandler(spinner?: Ora, spinnerText?: string) {
  return (percentage: number) => {
    if (spinner && spinnerText) {
      spinner.text = `${spinnerText} ${dim(
        `(${Math.round(percentage * 100)}%)`,
      )}`;
    }
  };
}

/**
 * Get the targets from the `.browserslistrc` file.
 *
 * @returns The browser targets as an array of strings.
 */
export async function getBrowserslistTargets() {
  const contents = await fs.readFile(BROWSERSLIST_FILE, 'utf8');
  return contents
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

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
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return count === 1 ? singular : plural;
}
