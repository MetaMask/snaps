import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import pathUtils from 'path';
import { logError } from '../../utils';

export const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

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
        await fs.mkdir(directory, { recursive: true });
      } catch (err) {
        logError('Init Error: Failed to create new directory.', err);
        throw err;
      }
    }

    const existingFiles = await fs.readdir(directory);

    if (existingFiles.length > 0) {
      throw new Error(`Directory not empty: ${directory}.`);
    }
  } catch (err) {
    logError('Init Error: Failed to prepare working directory.', err);
    throw err;
  }
}

/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
export async function cloneTemplate(directory: string) {
  try {
    execSync(`git clone --depth=1 ${TEMPLATE_GIT_URL} ${directory}`, {
      stdio: [2],
    });
  } catch (err) {
    logError('Init Error: Failed to clone the template.', err);
    throw err;
  }
}

/**
 * Check if git is installed.
 *
 * @returns True if git is installed, or false otherwise.
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
export async function gitInit(directory: string) {
  try {
    execSync('git init', {
      stdio: 'ignore',
      cwd: pathUtils.resolve(__dirname, directory),
    });
  } catch (err) {
    logError('Init Error: Failed to init a new git repository.', err);
    throw err;
  }
}

/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
export async function yarnInstall(directory: string) {
  try {
    execSync('yarn install', {
      stdio: [0, 1, 2],
      cwd: pathUtils.resolve(__dirname, directory),
    });
  } catch (err) {
    logError('Init Error: Failed to install dependencies.', err);
    throw err;
  }
}

export const SNAP_LOCATION = 'packages/snap/';
