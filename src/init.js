const { promises: fs, existsSync } = require('fs');
const pathUtils = require('path');
const packageInit = require('init-package-json');

const template = require('./initTemplate.json');
const {
  CONFIG_PATHS, logError, logWarning, prompt, closePrompt, trimPathString,
} = require('./utils');

const CONFIG_PATH = CONFIG_PATHS[0];

module.exports = async function initHandler(argv) {

  console.log(`Init: Begin building 'package.json'\n`);

  const package = await asyncPackageInit();

  await validateEmptyDir();

  console.log(`\nInit: Set 'package.json' web3Wallet properties\n`);

  const [_web3Wallet, newArgs] = await buildWeb3Wallet(argv);
  package.web3Wallet = _web3Wallet;

  try {
    await fs.writeFile('package.json', `${JSON.stringify(package, null, 2)}\n`);
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write package.json`, err);
    process.exit(1);
  }

  console.log(`\nInit: 'package.json' web3Wallet properties set successfully!`);

  // write main js entry file
  const { main } = package;
  newArgs.src = main;
  try {
    await fs.writeFile(main, template.js);
    console.log(`Init: Wrote main entry file '${main}'`);
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write main .js file '${main}'`, err);
    process.exit(1);
  }

  // write index.html
  try {
    await fs.writeFile('index.html', template.html.toString()
      .replace(/_PORT_/gu, newArgs.port || argv.port));
    console.log(`Init: Wrote 'index.html' file`);
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write index.html file`, err);
    process.exit(1);
  }

  // write config file
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(newArgs, null, 2));
    console.log(`Init: Wrote '${CONFIG_PATH}' config file`);
  } catch (err) {
    logError(`Init Error: Failed to write '${CONFIG_PATH}' file`, err);
  }

  closePrompt();
  return { ...argv, ...newArgs };
};

async function asyncPackageInit() {

  // use existing package.json if found
  const hasPackage = existsSync('package.json');

  if (hasPackage) {

    console.log(`Init: Attempting to use existing 'package.json'...`);

    try {

      const package = JSON.parse(await fs.readFile('package.json', 'utf8'));
      console.log(`Init: Successfully parsed 'package.json'!`);
      return package;
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
    logError(
      `Init Error: Found a 'yarn.lock' file but no 'package.json'. Please run 'yarn init' and try again.`,
    );
    process.exit(1);
  }

  // run 'npm init'
  return new Promise((resolve, reject) => {
    packageInit(process.cwd(), '', {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function buildWeb3Wallet(argv) {

  const { outfileName } = argv;
  const defaultPerms = { alert: {} };
  let { port, dist } = argv;
  let initialPermissions = defaultPerms;

  try {
    const c = await prompt(`Use all default Snap manifest values?`, 'yes');
    if (c && ['y', 'yes'].includes(c.toLowerCase())) {
      console.log('Using default values...');
      try {
        await fs.mkdir(dist);
      } catch (e) {
        if (e.code !== 'EEXIST') {
          logError(`Error: Could not write default 'dist' '${dist}'. Maybe check your local ${CONFIG_PATH} file?`);
        }
      }
      return endWeb3Wallet();
    }
  } catch (e) {
    logError(`Init Error: Fatal`, e);
    process.exit(1);
  }

  // at this point, prompt the user for all values
  let noValidPort = true;
  while (noValidPort) {
    // eslint-disable-next-line require-atomic-updates
    port = await prompt(`local server port:`, port);
    let err;
    try {
      const parsedPort = Number.parseInt(port, 10);
      if (parsedPort && parsedPort > 0) {
        port = parsedPort;
        noValidPort = false;
        break;
      }
    } catch (e) {
      err = e;
    }
    logError(`Invalid port '${port}, please retry.`, err);
  }

  let invalidDist = true;
  while (invalidDist) {
    // eslint-disable-next-line require-atomic-updates
    dist = await prompt(`output directory:`, dist);
    try {
      dist = trimPathString(dist);
      await fs.mkdir(dist);
      invalidDist = false;
      break;
    } catch (e) {
      if (e.code === 'EEXIST') {
        break;
      } else {
        logError(`Could not make directory '${dist}', please retry.`, e);
      }
    }
  }

  let invalidPermissions = true;
  while (invalidPermissions) {
    initialPermissions = await prompt(`initialPermissions: [perm1 perm2 ...] ([alert])`);
    let err;
    try {
      if (!initialPermissions) {
        initialPermissions = defaultPerms;
        break;
      }
      const splitPermissions = initialPermissions.split(' ')
        .reduce((acc, p) => {
          console.log(p);
          if (typeof p === 'string' && p.match(/^[\w\d_]+$/u)) {
            acc[p] = {};
          } else {
            logWarning(`Invalid permissions: ${p}`);
          }
          return acc;
        }, {});

      initialPermissions = splitPermissions || defaultPerms;
      invalidPermissions = false;
      break;
    } catch (e) {
      err = e;
    }
    logError(`Invalid initial permissions '${initialPermissions}', please retry.`, err);
  }

  return endWeb3Wallet();

  function endWeb3Wallet() {
    return [
      {
        bundle: {
          local: pathUtils.join(dist, outfileName),
          // url: `http://localhost:${port}/${dist}/${outfileName}`
          url: (new URL(`/${dist}/${outfileName}`, `http://localhost:${port}`)).toString(),
        },
        initialPermissions,
      },
      { port, dist, outfileName },
    ];
  }
}

async function validateEmptyDir() {
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
    const c = await prompt(`Continue?`, 'yes');
    const userAware = c && ['y', 'yes'].includes(c.toLowerCase());
    if (!userAware) {
      console.log(`Init: Exiting...`);
      process.exit(1);
    }
  }
}
