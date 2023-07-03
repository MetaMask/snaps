import { dim } from 'chalk';
import { Ora } from 'ora';
import { Configuration } from 'webpack';

import { ProcessedWebpackConfig } from '../config';

/**
 * Get the Webpack devtool configuration based on the given snap config.
 *
 * - If `sourceMap` is `inline`, return `inline-source-map`.
 * - If `sourceMap` is `true`, return `source-map`.
 * - Otherwise, return `false`.
 *
 * @param config - The processed snap Webpack config.
 * @param config.sourceMap - Whether to generate source maps.
 * @returns The Webpack devtool configuration.
 */
export function getDevTool({
  sourceMap,
}: ProcessedWebpackConfig): Configuration['devtool'] {
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
