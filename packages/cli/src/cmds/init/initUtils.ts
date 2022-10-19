import { promises as fs, constants, existsSync } from 'fs';
import { exec, execSync } from 'child_process';
import pathUtils from 'path';
import os from 'os';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { TemplateType } from '../../builders';

/**
 * Checks if the destination folder exists and if it's empty. Otherwise create it.
 *
 * @param directory - The desination folder.
 */
export async function prepareWorkingDirectory(
  directory: string,
): Promise<void> {
  const isCurrentDirectory = directory === process.cwd();

  if (!isCurrentDirectory && !existsSync(directory)) {
    try {
      mkdirp(directory);
    } catch (e) {
      throw Error('Failed to create new directory');
    }
  }

  const existingFiles = await fs.readdir(directory);

  if (existingFiles.length > 0) {
    throw Error('Directory not empty, please provide an empty directory.');
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
    return fs.mkdtemp(pathUtils.join(os.tmpdir(), 'snaps-cli-'));
  } catch (err) {
    throw Error('Failed to create temporary folder');
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
    exec(
      `git clone --depth=1 ${TEMPLATE_GIT_URL} ${TEMPLATE_FOLDER_NAME}`,
      {
        cwd: directory,
      },
      (err, stdout, stderr) => {
        if (err) {
          throw err;
        }
        console.log(stdout);
        console.error(stderr);
      },
    );
  } catch (e) {
    throw Error('Failed to clone the template.');
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
 * Check if the actual working dir is a git repository.
 *
 * @returns True if it's a git repository otherwise false.
 */
export function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Init a git repository.
 */
export function gitInit() {
  try {
    execSync('git init', { stdio: 'ignore' });
  } catch (e) {
    console.warn('Git repo not initialized', e);
    throw new Error('Failed do init a new repository');
  }
}
