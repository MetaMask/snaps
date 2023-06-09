import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import pathUtils from 'path';

export const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

export const SNAP_LOCATION = 'packages/snap/';

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
      } catch (error) {
        throw new Error('Init Error: Failed to create new directory.');
      }
    }

    const existingFiles = await fs.readdir(directory);

    if (existingFiles.length > 0) {
      throw new Error(`Directory ${directory} not empty.`);
    }
  } catch (error) {
    throw new Error(
      `Init Error: Failed to prepare working directory with message: ${error.message}`,
    );
  }
}

/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
export function cloneTemplate(directory: string) {
  try {
    execSync(`git clone --depth=1 ${TEMPLATE_GIT_URL} ${directory}`, {
      stdio: [2],
    });
  } catch (error) {
    throw new Error('Init Error: Failed to clone the template.');
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    throw new Error('Init Error: Failed to init a new git repository.');
  }
}

/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
export function yarnInstall(directory: string) {
  try {
    execSync('yarn install', {
      stdio: [0, 1, 2],
      cwd: directory,
    });
  } catch (error) {
    throw new Error('Init Error: Failed to install dependencies.');
  }
}

/**
 * Build the snap project.
 *
 * @param snapDirectory - The directory containing the snap.
 */
export function buildSnap(snapDirectory: string) {
  try {
    execSync('yarn build', {
      stdio: [0, 1, 2],
      cwd: pathUtils.resolve(__dirname, snapDirectory),
    });
  } catch (error) {
    throw new Error('Init Error: Failed to build snap.');
  }
}
