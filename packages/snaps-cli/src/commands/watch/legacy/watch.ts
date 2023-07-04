import {
  logError,
  logInfo,
  NpmSnapFileNames,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '@metamask/snaps-utils';
import chokidar from 'chokidar';
import { dirname, join } from 'path';

import { ProcessedBrowserifyConfig } from '../../../config';
import { CONFIG_FILE, TS_CONFIG_FILE } from '../../../utils';
import { legacyBuild } from '../../build/legacy';
import { evaluate } from '../../eval';
import { manifest } from '../../manifest';
import { serveHandler } from '../../serve/serve';

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param config - The config object.
 * @deprecated
 */
export async function legacyWatch(
  config: ProcessedBrowserifyConfig,
): Promise<void> {
  const {
    dist,
    eval: shouldEval,
    manifest: checkManifest,
    outfileName,
    src,
    serve: shouldServe,
    writeManifest: fix,
  } = config.cliOptions;

  if (outfileName) {
    validateOutfileName(outfileName);
  }

  await validateFilePath(src);
  await validateDirPath(dist, true);
  const srcDir = dirname(src);
  const watchDirs = [
    srcDir,
    NpmSnapFileNames.Manifest,
    CONFIG_FILE,
    TS_CONFIG_FILE,
  ];

  const buildSnap = async (logMessage?: string) => {
    if (logMessage !== undefined) {
      logInfo(logMessage);
    }

    await legacyBuild(config);

    if (checkManifest) {
      const manifestPath = join(process.cwd(), NpmSnapFileNames.Manifest);
      await manifest(manifestPath, fix);
    }

    if (shouldEval) {
      const bundle = join(dist, outfileName);
      await evaluate(bundle);
    }
  };

  chokidar
    .watch(watchDirs, {
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        `**/test/**`,
        `**/tests/**`,
        `**/*.test.js`,
        `**/*.test.ts`,
        join(dist, '**'),
        /* istanbul ignore next */
        (str: string) => str !== '.' && str.startsWith('.'),
      ],
    })

    .on('ready', () => {
      buildSnap()
        .then(() => {
          if (shouldServe) {
            return serveHandler(config, {});
          }

          return undefined;
        })
        .catch((error) => {
          logError('Error during initial build.', error);
        });
    })
    .on('add', (path) => {
      buildSnap(`File added: ${path}`).catch((error) => {
        logError(`Error while processing "${path}".`, error);
      });
    })
    .on('change', (path) => {
      buildSnap(`File changed: ${path}`).catch((error) => {
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
