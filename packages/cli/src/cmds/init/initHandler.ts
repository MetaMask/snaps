import { promises as fs, extra as fsExtra } from 'fs';
import os from 'os';
import pathUtils from 'path';
import { exec } from 'child_process';
import {
  NpmSnapFileNames,
  SnapManifest,
  getSnapSourceShasum,
  getWritableManifest,
  readJsonFile,
  satisfiesVersionRange,
} from '@metamask/snap-utils';
import mkdirp from 'mkdirp';
import { YargsArgs } from '../../types/yargs';
import { closePrompt, CONFIG_FILE, logError, SnapConfig } from '../../utils';
import { TemplateType } from '../../builders';
import template from './init-template.json';
import {
  asyncPackageInit,
  buildSnapManifest,
  isTemplateTypescript,
  prepareWorkingDirectory,
} from './initUtils';

const SATISFIED_VERSION = '>=16';

const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

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
  const isVersionSupported = satisfiesVersionRange(
    process.version,
    SATISFIED_VERSION,
  );

  if (!isVersionSupported) {
    console.error(
      `Init Error: You are using an outdated version of Node (${process.version}). Please update to Node ${SATISFIED_VERSION}.`,
    );
  }

  await prepareWorkingDirectory();

  try {
    // create temporary folder to clone template;
    const tmpDirPrefix = 'snap-template-tmp';
    const tmpDir = await fs.mkdtemp(pathUtils.join(os.tmpdir(), tmpDirPrefix));
    await mkdirp(tmpDir);

    exec(
      `git clone ${TEMPLATE_GIT_URL}`,
      {
        cwd: tmpDir,
      },
      (err, stdout, stderr) => {
        if (err) {
          throw err;
        }
        console.log(stdout);
        console.error(stderr);
      },
    );
  } catch (err) {
    logError(`Init Error: Failed to create temporary directory.`, err);
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
  const manifest = await readJsonFile<SnapManifest>(NpmSnapFileNames.Manifest);

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
