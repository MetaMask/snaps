import { existsSync, promises as fs } from 'fs';
import pathUtils from 'path';
import {
  PROPOSED_NAME_REGEX,
  NpmSnapFileNames,
  SnapManifest,
  NpmSnapPackageJson,
  validateSnapJsonFile,
} from '@metamask/snap-utils';

import initPackageJson from 'init-package-json';
import mkdirp from 'mkdirp';
import slash from 'slash';
import { Arguments } from 'yargs';
import { YargsArgs } from '../../types/yargs';
import {
  CONFIG_FILE,
  deepClone,
  logError,
  logWarning,
  prompt,
  readJsonFile,
  trimPathString,
} from '../../utils';
import { TemplateType } from '../../builders';

/**
 * This is a placeholder shasum that will be replaced at the end of the init command.
 */
const PLACEHOLDER_SHASUM = '2QqUxo5joo4kKKr7yiCjdYsZOZcIFBnIBEdwU9Yx7+M=';

const NPM_PUBLIC_REGISTRY_URL = 'https://registry.npmjs.org';

/**
 * Initializes a `package.json` file for a Snap project. Will attempt to read
 * and parse the existing file if it already exists, otherwise will intialize
 * a brand new one.
 *
 * @param argv - Yargs arguments object.
 * @returns The contents of the `package.json` file.
 */
export async function asyncPackageInit(
  argv: YargsArgs,
): Promise<Readonly<NpmSnapPackageJson>> {
  if (existsSync(NpmSnapFileNames.PackageJson)) {
    console.log(
      `Init: Attempting to use existing '${NpmSnapFileNames.PackageJson}'...`,
    );

    try {
      const packageJson = await readJsonFile(NpmSnapFileNames.PackageJson);
      validateSnapJsonFile(NpmSnapFileNames.PackageJson, packageJson);

      console.log(
        `Init: Successfully parsed '${NpmSnapFileNames.PackageJson}'!`,
      );
      return packageJson as NpmSnapPackageJson;
    } catch (error) {
      logError(
        `Init Error: Could not parse '${NpmSnapFileNames.PackageJson}'. Please verify that the file is correctly formatted and try again.`,
        error,
      );
      throw error;
    }
  }

  // Exit if yarn.lock is found, or we'll be in trouble
  if (existsSync('yarn.lock')) {
    logError(
      `Init Error: Found a 'yarn.lock' file but no '${NpmSnapFileNames.PackageJson}'. Please run 'yarn init' and try again.`,
    );
    throw new Error('Already existing yarn.lock file found');
  }

  // Run 'npm init'
  return new Promise((resolve, reject) => {
    initPackageJson(
      process.cwd(),
      '',
      {
        'init.main': argv.src,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      },
    );
  });
}

const YES = 'yes';
const YES_VALUES = new Set([YES, 'y']);

/**
 * Checks if user input provided over a prompt is "yes", i.e., if the value is
 * truthy and in the {@link YES_VALUES} set.
 *
 * @param userInput - The user input to check.
 * @returns `true` if the user input is "yes", `false` otherwise.
 */
function isYes(userInput: string | undefined) {
  return userInput && YES_VALUES.has(userInput.toLowerCase());
}

const DEFAULT_PERMISSION_KEY = 'snap_confirm';

/**
 * Get the default permissions to write to the snap manifest.
 *
 * @returns An object containing the default permissions.
 */
const getDefaultPermissions = () => {
  return { [DEFAULT_PERMISSION_KEY]: {} };
};

/**
 * Interactively constructs a Snap manifest file by prompting the user.
 *
 * @param argv - The `yargs` `argv` object.
 * @param packageJson - The `package.json` object.
 * @returns A tuple of the resulting Snap manifest object and a new `argv`
 * object with properties to match the manifest.
 */
export async function buildSnapManifest(
  argv: YargsArgs,
  packageJson: NpmSnapPackageJson,
): Promise<[SnapManifest, { dist: string; outfileName: string; src: string }]> {
  const { outfileName } = argv;
  let { dist } = argv;
  let initialPermissions: Record<string, unknown> = getDefaultPermissions();
  let { description, name: proposedName } = packageJson;

  if (!description) {
    description = `The ${proposedName} Snap.`;
  }

  try {
    const userInput = await prompt({
      question: `Use default Snap manifest values?`,
      defaultValue: YES,
      shouldClose: false,
    });

    if (isYes(userInput)) {
      console.log('Using default values...');
      try {
        await mkdirp(dist);
      } catch (err) {
        logError(
          `Init Error: Could not write default 'dist' '${dist}'. Maybe check your local ${CONFIG_FILE} file?`,
        );
        throw err;
      }
      return endSnapManifest();
    }
  } catch (err) {
    logError(`Init Error: ${err.message}`, err);
    throw err;
  }

  let invalidProposedName = true;
  while (invalidProposedName) {
    // eslint-disable-next-line require-atomic-updates
    proposedName = await prompt({
      question: `Proposed Snap name:`,
      defaultValue: proposedName,
    });

    if (
      proposedName.length > 0 &&
      proposedName.length <= 214 &&
      PROPOSED_NAME_REGEX.test(proposedName)
    ) {
      invalidProposedName = false;
    } else {
      logError(
        `The proposed name must adhere to npm package naming conventions, except that capital letters are allowed. For details, see: https://docs.npmjs.com/cli/v6/configuring-npm/package-json#name`,
      );
    }
  }

  let invalidDescription = true;
  while (invalidDescription) {
    // eslint-disable-next-line require-atomic-updates
    description = await prompt({
      question: `Description:`,
      defaultValue: description,
    });

    if (description.length === 0 || description.length <= 280) {
      invalidDescription = false;
    } else {
      logError(
        `The description must be a non-empty string less than or equal to 280 characters.`,
      );
    }
  }

  let invalidDist = true;
  while (invalidDist) {
    // eslint-disable-next-line require-atomic-updates
    dist = await prompt({ question: `Output directory:`, defaultValue: dist });
    try {
      dist = trimPathString(dist);
      await mkdirp(dist);
      invalidDist = false;
    } catch (distError) {
      logError(
        `Unable to create directory '${dist}'. Ensure that the path is valid and try again.`,
        distError,
      );
    }
  }

  let invalidPermissions = true;
  while (invalidPermissions) {
    const inputPermissions = await prompt({
      // We add the parenthetical default value ourselves
      question: `Initial permissions: [perm1 perm2 ...] ([snap_confirm])`,
    });

    if (
      !inputPermissions ||
      inputPermissions.trim() === DEFAULT_PERMISSION_KEY
    ) {
      break;
    }

    try {
      initialPermissions = inputPermissions
        .split(' ')
        .reduce((allPermissions, permission) => {
          if (
            typeof permission === 'string' &&
            permission.match(/^[\w\d_:]+$/iu)
          ) {
            allPermissions[permission] = {};
          } else {
            throw new Error(`Invalid permission: ${permission}`);
          }
          return allPermissions;
        }, {} as Record<string, unknown>);

      invalidPermissions = false;
    } catch (err) {
      logError(
        `Invalid permissions '${inputPermissions}'.\nThe permissions must be specified as a space-separated list of strings with only characters, digits, underscores ('_'), and colons (':').`,
        err,
      );
    }
  }

  return endSnapManifest();

  /**
   * Get the final snap manifest object and return it, along with the dist and
   * file names.
   *
   * @returns A tuple of the resulting snap manifest object and an object
   * containing the dist and file names.
   */
  function endSnapManifest(): [
    SnapManifest,
    {
      dist: string;
      outfileName: string;
      src: string;
    },
  ] {
    const manifest = {
      version: packageJson.version,
      description,
      proposedName,
      repository: packageJson.repository
        ? deepClone(packageJson.repository)
        : null,
      source: {
        shasum: PLACEHOLDER_SHASUM,
        location: {
          npm: {
            filePath: slash(pathUtils.join(dist, outfileName)),
            packageName: packageJson.name,
            registry: NPM_PUBLIC_REGISTRY_URL,
            iconPath: 'images/icon.svg',
          } as const,
        },
      },
      initialPermissions,
      manifestVersion: '0.1' as const,
    };

    try {
      validateSnapJsonFile(NpmSnapFileNames.Manifest, manifest);
    } catch (error) {
      /* istanbul ignore next */
      throw new Error(
        `Internal Error: Validation of constructed manifest failed. This is a bug, please report it. Reason:\n${error.message}`,
      );
    }

    return [
      manifest,
      { dist, outfileName, src: packageJson.main || 'src/index.js' },
    ];
  }
}

const INIT_FILE_NAMES = new Set([
  'src',
  'index.html',
  CONFIG_FILE,
  'dist',
  NpmSnapFileNames.Manifest,
]);

/**
 * Checks whether any files in the current working directory will be overwritten
 * by the initialization process, and asks the user whether to continue if so.
 */
export async function prepareWorkingDirectory(): Promise<void> {
  const existingFiles = (await fs.readdir(process.cwd())).filter((item) =>
    INIT_FILE_NAMES.has(item.toString()),
  );

  if (existingFiles.length > 0) {
    logWarning(
      `\nInit Warning: Existing files and/or directories may be overwritten:\n${existingFiles.reduce(
        (message, currentFile) => {
          return `${message}\t${currentFile}\n`;
        },
        '',
      )}`,
    );

    const continueInput = await prompt({
      question: `Continue?`,
      defaultValue: YES,
    });
    const shouldContinue = continueInput && isYes(continueInput);

    if (!shouldContinue) {
      console.log(`Init: Exiting...`);
      throw new Error('User refused to continue');
    }
  }
}

/**
 * In case when TypeScript version is used, default source file
 * will be updated if previous was not correct.
 *
 * @param yargsArgv - The Yargs arguments object.
 * @returns Modified Yargs arguments object.
 */
export function correctDefaultArgs(yargsArgv: Arguments): Arguments {
  if (
    yargsArgv.template === TemplateType.TypeScript &&
    yargsArgv.src === 'src/index.js'
  ) {
    yargsArgv.src = 'src/index.ts';
    yargsArgv.s = 'src/index.ts';
  }

  return yargsArgv;
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
