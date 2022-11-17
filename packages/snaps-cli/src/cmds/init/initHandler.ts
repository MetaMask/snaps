import {
  NpmSnapFileNames,
  SnapManifest,
  readJsonFile,
  satisfiesVersionRange,
  NpmSnapPackageJson,
} from '@metamask/snaps-utils';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { YargsArgs } from '../../types/yargs';
import {
  cloneTemplate,
  gitInit,
  isGitInstalled,
  isInGitRepository,
  prepareWorkingDirectory,
  SNAP_LOCATION,
  yarnInstall,
} from './initUtils';

const SATISFIED_VERSION = '>=16';

/**
 * Creates a new snap package, based on one of the provided templates. This
 * creates all the necessary files, like `package.json`, `snap.config.js`, etc.
 * to start developing a snap.
 *
 * @param argv - The Yargs arguments object.
 * @returns The Yargs arguments augmented with the new `dist`, `outfileName` and
 * `src` properties.
 * @throws If initialization of the snap package failed.
 */
export async function initHandler(argv: YargsArgs) {
  const { directory } = argv;

  const isVersionSupported = satisfiesVersionRange(
    process.version,
    SATISFIED_VERSION,
  );

  if (!isVersionSupported) {
    throw new Error(
      `Init Error: You are using an outdated version of Node (${process.version}). Please update to Node ${SATISFIED_VERSION}.`,
    );
  }

  const gitExists = isGitInstalled();
  if (!gitExists) {
    throw new Error(
      `Init Error: git is not installed. Please install git to continue.`,
    );
  }

  const directoryToUse = directory
    ? pathUtils.join(process.cwd(), directory)
    : process.cwd();

  console.log(`Preparing ${directoryToUse}...`);

  await prepareWorkingDirectory(directoryToUse);

  try {
    console.log(`Cloning template...`);
    cloneTemplate(directoryToUse);

    await fs.rm(pathUtils.join(directoryToUse, '.git'), {
      force: true,
      recursive: true,
    });
  } catch (error) {
    throw new Error('Init Error: Failed to create template.');
  }

  console.log('Installing dependencies...');
  yarnInstall(directoryToUse);

  if (!isInGitRepository(directoryToUse)) {
    console.log('Initializing git repository...');
    gitInit(directoryToUse);
  }

  const snapLocation = pathUtils.join(directoryToUse, SNAP_LOCATION);

  const manifest: SnapManifest = await readJsonFile(
    pathUtils.join(snapLocation, NpmSnapFileNames.Manifest),
  );
  const packageJson: NpmSnapPackageJson = await readJsonFile(
    pathUtils.join(snapLocation, NpmSnapFileNames.PackageJson),
  );

  const distPath = manifest.source.location.npm.filePath.split('/');

  return {
    ...argv,
    dist: distPath[0],
    outfileName: distPath[1],
    src: packageJson.main || 'src/index.js',
    snapLocation,
  };
}
