import {
  getSnapSourceShasum,
  NpmSnapFileNames,
  SnapManifest,
} from '@metamask/snap-controllers';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import pathUtils from 'path';
import { YargsArgs } from '../../types/yargs';
import { closePrompt, CONFIG_FILE, logError, readJsonFile } from '../../utils';
import { getWritableManifest } from '../manifest/manifestHandler';
import template from './init-template.json';
import {
  asyncPackageInit,
  buildSnapManifest,
  prepareWorkingDirectory,
} from './initUtils';

export async function initHandler(argv: YargsArgs) {
  console.log(`MetaMask Snaps: Initialize\n`);

  const packageJson = await asyncPackageInit();

  await prepareWorkingDirectory();

  console.log(`\nInit: Building '${NpmSnapFileNames.Manifest}'...\n`);

  const [snapManifest, _newArgs] = await buildSnapManifest(argv, packageJson);

  const newArgs = Object.keys(_newArgs)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = _newArgs[key as keyof typeof _newArgs];
      return sorted;
    }, {} as YargsArgs);

  try {
    await fs.writeFile(
      NpmSnapFileNames.Manifest,
      `${JSON.stringify(snapManifest, null, 2)}\n`,
    );
  } catch (err) {
    logError(
      `Init Error: Failed to write '${NpmSnapFileNames.Manifest}'.`,
      err,
    );
    throw err;
  }

  console.log(`\nInit: Created '${NpmSnapFileNames.Manifest}'.`);

  // Write main .js entry file
  const { src } = newArgs;
  try {
    if (pathUtils.basename(src) !== src) {
      await mkdirp(pathUtils.dirname(src));
    }

    await fs.writeFile(src, template.source);
    console.log(`Init: Created '${src}'.`);
  } catch (err) {
    logError(`Init Error: Failed to write '${src}'.`, err);
    throw err;
  }

  // Write index.html
  try {
    await fs.writeFile('index.html', template.html);
    console.log(`Init: Created 'index.html'.`);
  } catch (err) {
    logError(`Init Error: Failed to write 'index.html'.`, err);
    throw err;
  }

  // Write config file
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newArgs, null, 2));
    console.log(`Init: Wrote '${CONFIG_FILE}' config file`);
  } catch (err) {
    logError(`Init Error: Failed to write '${CONFIG_FILE}'.`, err);
    throw err;
  }

  closePrompt();
  return { ...argv, ...newArgs };
}

/**
 * This updates the Snap shasum value of the manifest after building the Snap
 * during the init command.
 */
export async function updateManifestShasum() {
  const manifest = (await readJsonFile(
    NpmSnapFileNames.Manifest,
  )) as SnapManifest;

  const bundleContents = await fs.readFile(
    manifest.source.location.npm.filePath,
    'utf8',
  );

  manifest.source.shasum = getSnapSourceShasum(bundleContents);
  await fs.writeFile(
    NpmSnapFileNames.Manifest,
    JSON.stringify(getWritableManifest(manifest), null, 2),
  );
}
