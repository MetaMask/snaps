import type { PreinstalledSnap } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { getErrorMessage } from '@metamask/utils';
import { readFile, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import createSpinner from 'yocto-spinner';

import packageFile from '../package.json' with { type: 'json' };

const CURRENT_PATH = dirname(fileURLToPath(import.meta.url));
const ROOT_PATH = join(CURRENT_PATH, '..');

const SNAP_BUNDLE_PATH = join(ROOT_PATH, 'dist/bundle.js');
const SNAP_ICON_PATH = join(ROOT_PATH, 'images/icon.svg');
const SNAP_MANIFEST_PATH = join(ROOT_PATH, 'snap.manifest.json');

/**
 * Check if a file exists.
 *
 * @param filePath - Path to the file to check.
 * @returns Whether the file exists.
 */
async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

/**
 * Get the files to include in the preinstalled Snap manifest. This includes the
 * bundle and icon file (if it exists).
 *
 * @returns The snap files.
 */
async function getSnapFiles() {
  if (!(await fileExists(SNAP_BUNDLE_PATH))) {
    throw new Error(
      'Bundle file not found. Make sure to build the project first.',
    );
  }

  const files: { path: string; value: string }[] = [
    {
      path: 'dist/bundle.js',
      value: await readFile(SNAP_BUNDLE_PATH, 'utf-8'),
    },
  ];

  if (await fileExists(SNAP_ICON_PATH)) {
    files.push({
      path: 'images/icon.svg',
      value: await readFile(SNAP_ICON_PATH, 'utf-8'),
    });
  }

  return files;
}

const spinner = createSpinner();
spinner.start('Creating preinstalled Snap manifest');

try {
  const manifest = await readFile(SNAP_MANIFEST_PATH, 'utf-8');
  const preinstalledSnapManifest: PreinstalledSnap = {
    snapId: `npm:${packageFile.name}` as SnapId,
    manifest: JSON.parse(manifest),
    files: await getSnapFiles(),
    removable: false,
    hideSnapBranding: true,
  };

  const outputPath = join(CURRENT_PATH, '..', 'dist/preinstalled-snap.json');
  await writeFile(outputPath, JSON.stringify(preinstalledSnapManifest));

  spinner.success('Preinstalled Snap manifest created.');
} catch (error) {
  spinner.error(getErrorMessage(error));
  process.exitCode = 1;
}
