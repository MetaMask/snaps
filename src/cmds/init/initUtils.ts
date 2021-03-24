import { promises as fs, existsSync } from 'fs';
import pathUtils from 'path';
import initPackageJson from 'init-package-json';
import { CONFIG_PATHS, logError, logWarning, prompt, trimPathString } from '../../utils';
import { YargsArgs } from '../../types/yargs';
import { ManifestWalletProperty, NodePackageManifest } from '../../types/package';

const CONFIG_PATH = CONFIG_PATHS[0];

export async function asyncPackageInit(): Promise<NodePackageManifest> {

  // use existing package.json if found
  const hasPackage = existsSync('package.json');

  if (hasPackage) {

    console.log(`Init: Attempting to use existing 'package.json'...`);

    try {

      const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
      console.log(`Init: Successfully parsed 'package.json'!`);
      return pkg;
    } catch (error) {

      logError(
        `Init Error: Could not parse 'package.json'. Please verify that the file is correctly formatted and try again.`,
        error,
      );
      process.exit(1);
    }
  }

  // exit if yarn.lock is found, or we'll be in trouble
  const usesYarn = existsSync('yarn.lock');

  if (usesYarn) {
    logError(`Init Error: Found a 'yarn.lock' file but no 'package.json'. Please run 'yarn init' and try again.`);
    process.exit(1);
  }

  // run 'npm init'
  return new Promise((resolve, reject) => {
    initPackageJson(process.cwd(), '', {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function buildWeb3Wallet(argv: YargsArgs): Promise<[
  ManifestWalletProperty,
  { port: number; dist: string; outfileName: string },
]> {

  const outfileName = argv.outfileName as string;
  let { port, dist } = argv;
  const defaultPerms = { alert: {} };
  let initialPermissions: Record<string, unknown> = defaultPerms;

  try {
    const userInput = await prompt({ question: `Use all default Snap manifest values?`, defaultValue: 'yes', shouldClose: false });
    if (userInput && ['y', 'yes'].includes(userInput.toLowerCase())) {
      console.log('Using default values...');
      try {
        await fs.mkdir(dist);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          logError(`Init Error: Could not write default 'dist' '${dist}'. Maybe check your local ${CONFIG_PATH} file?`);
          throw err;
        }
      }
      return endWeb3Wallet();
    }
  } catch (err) {
    logError(`Init Error: ${err.message}`, err);
    process.exit(1);
  }

  // at this point, prompt the user for all values
  let noValidPort = true;
  while (noValidPort) {
    const inputPort = (await prompt({ question: `local server port:`, defaultValue: port.toString(10) }));
    const parsedPort = Number.parseInt(inputPort, 10);
    if (parsedPort && parsedPort > 0) {
      // eslint-disable-next-line require-atomic-updates
      port = parsedPort;
      noValidPort = false;
    } else {
      logError(`Invalid port '${parsedPort}', please retry.`);
    }
  }

  let invalidDist = true;
  while (invalidDist) {
    // eslint-disable-next-line require-atomic-updates
    dist = await prompt({ question: `output directory:`, defaultValue: dist });
    try {
      dist = trimPathString(dist);
      await fs.mkdir(dist);
      invalidDist = false;
    } catch (distError) {
      if (distError.code === 'EEXIST') {
        invalidDist = false;
      } else {
        logError(`Could not make directory '${dist}', please retry.`, distError);
      }
    }
  }

  let invalidPermissions = true;
  while (invalidPermissions) {
    const inputPermissions = (await prompt({ question: `initialPermissions: [perm1 perm2 ...] ([alert])` }));
    try {
      if (inputPermissions) {
        initialPermissions = inputPermissions.split(' ')
          .reduce((allPermissions, permission) => {
            if (typeof permission === 'string' && permission.match(/^[\w\d_]+$/u)) {
              allPermissions[permission] = {};
            } else {
              throw new Error(`Invalid permission: ${permission}`);
            }
            return allPermissions;
          }, {} as Record<string, unknown>);

        invalidPermissions = false;
      } else {
        initialPermissions = defaultPerms;
        invalidPermissions = false;
      }
    } catch (err) {
      logError(`Invalid permissions '${inputPermissions}', please retry.`, err);
    }
  }

  return endWeb3Wallet();

  function endWeb3Wallet(): ([
    ManifestWalletProperty,
    {
      port: number;
      dist: string;
      outfileName: string;
    },
  ]) {
    return [
      {
        bundle: {
          local: pathUtils.join(dist, outfileName as string),
          url: (new URL(`/${dist}/${outfileName}`, `http://localhost:${port}`)).toString(),
        },
        initialPermissions,
      },
      { dist, outfileName, port },
    ];
  }
}

export async function validateEmptyDir(): Promise<void> {
  const existing = (await fs.readdir(process.cwd())).filter((item) => [
    'index.js', 'index.html', CONFIG_PATH, 'dist',
  ].includes(item.toString()));

  if (existing.length > 0) {
    logWarning(
      `\nInit Warning: Existing files/directories may be overwritten:\n${
        existing.reduce((acc, curr) => {
          return `${acc}\t${curr}\n`;
        }, '')}`,
    );

    const continueInput = await prompt({ question: `Continue?`, defaultValue: 'yes' });
    const shouldContinue = continueInput && ['y', 'yes'].includes(continueInput.toLowerCase());

    if (!shouldContinue) {
      console.log(`Init: Exiting...`);
      process.exit(1);
    }
  }
}
