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
