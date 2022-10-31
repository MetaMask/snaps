import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import pathUtils from 'path';
import { tmpdir } from 'os';
import { mkdirp, copy } from 'fs-extra';
import { TemplateType } from '../../builders';
import { logError } from '../../utils';

/**
 * Checks if the destination folder exists and if it's empty. Otherwise create it.
 *
 * @param directory - The desination folder.
 */
export async function prepareWorkingDirectory(
  directory: string,
): Promise<void> {
  try {
    const isCurrentDirectory = directory === process.cwd();

    if (!isCurrentDirectory) {
      try {
        await mkdirp(directory);
      } catch (err) {
        logError('Init Error: Failed to create new directory', err);
      }
    }

    const existingFiles = await fs.readdir(directory);

    if (existingFiles.length > 0) {
      throw new Error(`Directory not empty: ${directory}`);
    }
  } catch (err) {
    logError('Init Error: Failed to prepare working directory', err);
    throw err;
  }
}

/**
 * Check if template argument is TemplateType.TypeScript.
 *
 * @param templateType - TemplateType value of the template argument passed from CLI.
 * @returns True or false.
 */
export function isTemplateTypescript(templateType: TemplateType): boolean {
  return templateType === TemplateType.TypeScript;
}

/**
 * Create a temporary folder in system's temporary directory.
 *
 * @returns The temporary directory path.
 */
export async function createTemporaryDirectory() {
  try {
    return fs.mkdtemp(pathUtils.join(tmpdir(), 'snaps-cli-'));
  } catch (err) {
    logError('Init Error: Failed to create temporary folder', err);
    throw err;
  }
}

const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

export const TEMPLATE_FOLDER_NAME = 'template';

/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
export async function cloneTemplate(directory: string) {
  try {
    execSync(
      `git clone --depth=1 ${TEMPLATE_GIT_URL} ${TEMPLATE_FOLDER_NAME}`,
      {
        stdio: [2],
        cwd: pathUtils.resolve(__dirname, directory),
      },
    );
  } catch (err) {
    logError('Init Error: Failed to clone the template.', err);
  }
}

/**
 * Check if git is installed.
 *
 * @returns True if git is installed otherwise false.
 */
export function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Copy the cloned template in the target folder.
 *
 * @param source - The directory containing the cloned template.
 * @param destination - The directory to copy the files into.
 */
export async function copyTemplate(source: string, destination: string) {
  try {
    await copy(pathUtils.join(source, TEMPLATE_FOLDER_NAME), destination, {
      filter: (fileName: string) => !fileName.split('/').includes('.git'),
    });
  } catch (err) {
    logError('Init error: Failed to copy template', err);
  }
}

/**
 * Check if the actual working dir is a git repository.
 *
 * @param directory - The directory to check.
 * @returns True if it's a git repository otherwise false.
 */
export function isInGitRepository(directory: string) {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      stdio: 'ignore',
      cwd: pathUtils.resolve(__dirname, directory),
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Init a git repository.
 *
 * @param directory - The directory to init.
 */
export function gitInit(directory: string) {
  try {
    execSync('git init', {
      stdio: 'ignore',
      cwd: pathUtils.resolve(__dirname, directory),
    });
  } catch (err) {
    logError('Init Error: Failed to init a new git repository', err);
  }
}

/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
export function yarnInstall(directory: string) {
  try {
    execSync('yarn', {
      stdio: [0, 1, 2],
      cwd: pathUtils.resolve(__dirname, directory),
    });

    execSync('yarn install', {
      stdio: [0, 1, 2],
      cwd: pathUtils.resolve(__dirname, directory),
    });
  } catch (err) {
    logError('Init Error: Failed to install dependencies', err);
  }
}

export const SNAP_LOCATION = 'packages/snap/';
