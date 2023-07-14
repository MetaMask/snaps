import type { NpmSnapPackageJson } from '@metamask/snaps-utils';
import {
  NpmSnapFileNames,
  readJsonFile,
  createSnapManifest,
  logInfo,
} from '@metamask/snaps-utils';
import type { SemVerRange, SemVerVersion } from '@metamask/utils';
import { satisfiesVersionRange } from '@metamask/utils';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import type { YargsArgs } from '../../types/yargs';
import {
  buildSnap,
  cloneTemplate,
  gitInit,
  isGitInstalled,
  isInGitRepository,
  prepareWorkingDirectory,
  SNAP_LOCATION,
  yarnInstall,
} from './initUtils';

const SATISFIED_VERSION = '>=16' as SemVerRange;

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
    process.version as SemVerVersion,
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
    ? pathUtils.resolve(process.cwd(), directory)
    : process.cwd();

  logInfo(`Preparing ${directoryToUse}...`);

  await prepareWorkingDirectory(directoryToUse);

  try {
    logInfo(`Cloning template...`);
    cloneTemplate(directoryToUse);

    await fs.rm(pathUtils.join(directoryToUse, '.git'), {
      force: true,
      recursive: true,
    });
  } catch (error) {
    throw new Error('Init Error: Failed to create template.');
  }

  logInfo('Installing dependencies...');
  yarnInstall(directoryToUse);

  if (!isInGitRepository(directoryToUse)) {
    logInfo('Initializing git repository...');
    gitInit(directoryToUse);
  }

  const snapLocation = pathUtils.join(directoryToUse, SNAP_LOCATION);

  logInfo('Running initial build...');
  buildSnap(snapLocation);

  const manifest = (
    await readJsonFile(pathUtils.join(snapLocation, NpmSnapFileNames.Manifest))
  ).result;

  const validatedManifest = createSnapManifest(manifest);

  const packageJson = (
    await readJsonFile(
      pathUtils.join(snapLocation, NpmSnapFileNames.PackageJson),
    )
  ).result as NpmSnapPackageJson;

  const distPath = validatedManifest.source.location.npm.filePath.split('/');

  return {
    ...argv,
    dist: distPath[0],
    outfileName: distPath[1],
    src: packageJson.main || 'src/index.js',
    snapLocation,
  };
}
