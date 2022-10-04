import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { exec, execSync } from 'child_process';
import pathUtils from 'path';
import mkdirp from 'mkdirp';
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

  if (!isCurrentDirectory && !directoryExists(directory)) {
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
 * Check if the provided directory exists.
 *
 * @param directory - The directory to access.
 * @returns True if the directory exists, false otherwise.
 */
export async function directoryExists(directory: string) {
  try {
    await fs.access(directory);
    return true;
  } catch (err) {
    return false;
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
 * Creates a temporary directory.
 *
 * @returns The temporary directory path.
 */
export async function createTemporaryDirectory() {
  try {
    const tmpDirPrefix = 'snap-template-tmp';
    const tmpDir = await fs.mkdtemp(pathUtils.join(tmpdir(), tmpDirPrefix));
    await mkdirp(tmpDir);

    return tmpDir;
  } catch (e) {
    throw Error('Failed to create temporary folder');
  }
}

const TEMPLATE_GIT_URL =
  'https://github.com/MetaMask/template-snap-monorepo.git';

/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
export async function cloneTemplate(directory: string) {
  try {
    exec(
      `git clone ${TEMPLATE_GIT_URL}`,
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
