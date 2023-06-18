import {
  logError,
  logInfo,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
  NpmSnapFileNames,
} from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import chokidar from 'chokidar';
import pathUtils from 'path';

import type { ProcessedConfig } from '../../config';
import { CONFIG_FILE } from '../../utils';
import { build } from '../build/build';
import { evaluate } from '../eval/eval';
import { manifest } from '../manifest/manifest';
import { serve } from '../serve/serve';

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export async function watch(config: ProcessedConfig): Promise<void> {
  assert(config.bundler === 'browserify');

  const {
    dist,
    eval: shouldEval,
    manifest: checkManifest,
    outfileName,
    src,
    serve: shouldServe,
  } = config.cliOptions;

  if (outfileName) {
    validateOutfileName(outfileName);
  }

  await validateFilePath(src);
  await validateDirPath(dist, true);
  const srcDir = pathUtils.dirname(src);
  const watchDirs = [srcDir, NpmSnapFileNames.Manifest, CONFIG_FILE];

  const buildSnap = async (path?: string, logMessage?: string) => {
    if (logMessage !== undefined) {
      logInfo(logMessage);
    }

    try {
      assert(config.bundler === 'browserify');
      await build(config);

      if (checkManifest) {
        await manifest(config);
      }

      if (shouldEval) {
        await evaluate(config);
      }
    } catch (error) {
      logError(
        `Error ${
          path === undefined
            ? 'during initial build'
            : `while processing "${path}"`
        }.`,
        error,
      );
    }
  };

  chokidar
    .watch(watchDirs, {
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        `**/${dist}/**`,
        `**/test/**`,
        `**/tests/**`,
        `**/*.test.js`,
        `**/*.test.ts`,
        /* istanbul ignore next */
        (str: string) => str !== '.' && str.startsWith('.'),
      ],
    })

    .on('ready', () => {
      buildSnap()
        .then(() => {
          if (shouldServe) {
            return serve(config);
          }

          return undefined;
        })
        .catch((error) => {
          logError('Error during initial build.', error);
        });
    })
    .on('add', (path) => {
      buildSnap(path, `File added: ${path}`).catch((error) => {
        logError(`Error while processing "${path}".`, error);
      });
    })
    .on('change', (path) => {
      buildSnap(path, `File changed: ${path}`).catch((error) => {
        logError(`Error while processing "${path}".`, error);
      });
    })
    .on('unlink', (path) => logInfo(`File removed: ${path}`))
    .on('error', (error: Error) => {
      logError(`Watcher error: ${error.message}`, error);
    });

  logInfo(
    `Watching ${watchDirs.map((dir) => `'${dir}'`).join(', ')} for changes...`,
  );
}
