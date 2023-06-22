import { isFile } from '@metamask/snaps-utils';

import { ProcessedConfig } from '../../config';
import { getCompiler } from '../../webpack';
import { legacyBuild } from './legacy';

/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export async function build(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    return await legacyBuild(config);
  }

  if (!(await isFile(config.input))) {
    throw new Error(
      `Input file not found: "${config.input}". Make sure that the "input" field in your snap config is correct.`,
    );
  }

  const compiler = getCompiler(config);
  return await new Promise<void>((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (stats?.hasErrors()) {
        reject(stats.toString());
        return;
      }

      resolve();
    });
  });
}
