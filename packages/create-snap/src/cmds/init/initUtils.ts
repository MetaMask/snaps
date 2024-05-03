import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import pathUtils from 'path';

export const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

export const SNAP_LOCATION = 'packages/snap/';

/**
 * Checks if the destination folder exists and if it's empty. Otherwise create it.
 *
 * @param directory - The destination folder.
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
  const result = spawnSync(
    'git',
    ['clone', '--depth=1', TEMPLATE_GIT_URL, directory],
    {
      stdio: [2],
    },
  );

  if (result.error || result.status !== 0) {
    throw new Error('Init Error: Failed to clone the template.');
  }
}

/**
 * Check if git is installed.
 *
 * @returns True if git is installed, or false otherwise.
 */
export function isGitInstalled() {
  const result = spawnSync('git', ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

/**
 * Check if the actual working dir is a git repository.
 *
 * @param directory - The directory to check.
 * @returns True if it's a git repository otherwise false.
 */
export function isInGitRepository(directory: string) {
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    stdio: 'ignore',
    cwd: pathUtils.resolve(__dirname, directory),
  });

  return result.status === 0;
}

/**
 * Init a git repository and make the first commit.
 *
 * @param directory - The directory to init.
 */
export function gitInitWithCommit(directory: string) {
  const commands = [
    {
      cmd: 'git',
      params: ['init'],
    },
    {
      cmd: 'git',
      params: ['add', '.'],
    },
    {
      cmd: 'git',
      params: ['commit', '-m', 'Initial commit from @metamask/create-snap'],
    },
  ];

  for (const command of commands) {
    const result = spawnSync(command.cmd, command.params, {
      stdio: 'ignore',
      cwd: pathUtils.resolve(__dirname, directory),
    });

    if (result.error || result.status !== 0) {
      throw new Error('Init Error: Failed to init a new git repository.');
    }
  }
}

/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
export function yarnInstall(directory: string) {
  const result = spawnSync('yarn', ['install'], {
    stdio: [0, 1, 2],
    cwd: directory,
  });

  if (result.error || result.status !== 0) {
    throw new Error('Init Error: Failed to install dependencies.');
  }
}

/**
 * Build the snap project.
 *
 * @param snapDirectory - The directory containing the snap.
 */
export function buildSnap(snapDirectory: string) {
  const result = spawnSync('yarn', ['build'], {
    stdio: [0, 1, 2],
    cwd: pathUtils.resolve(__dirname, snapDirectory),
  });

  if (result.error || result.status !== 0) {
    throw new Error('Init Error: Failed to build snap.');
  }
}
