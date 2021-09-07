import { promises as fs } from 'fs';
import { CONFIG_PATHS, logError, closePrompt } from '../../utils';
import { YargsArgs } from '../../types/yargs';
import template from './initTemplate.json';
import {
  asyncPackageInit,
  validateEmptyDir,
  buildWeb3Wallet,
} from './initUtils';

const CONFIG_PATH = CONFIG_PATHS[0];

export async function initHandler(argv: YargsArgs) {
  console.log(`Init: Begin building 'package.json'\n`);

  const pkg = await asyncPackageInit();

  await validateEmptyDir();

  console.log(`\nInit: Set 'package.json' web3Wallet properties\n`);

  const [web3Wallet, _newArgs] = await buildWeb3Wallet(argv);
  const newArgs = _newArgs as YargsArgs;
  pkg.web3Wallet = web3Wallet;

  try {
    await fs.writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write package.json`, err);
    process.exit(1);
  }

  console.log(`\nInit: 'package.json' web3Wallet properties set successfully!`);

  // write main js entry file
  const { main } = pkg;
  if (main !== undefined) {
    newArgs.src = main;
    try {
      await fs.writeFile(main, template.js);
      console.log(`Init: Wrote main entry file '${main}'`);
    } catch (err) {
      logError(
        `Init Error: Fatal: Failed to write main .js file '${main}'`,
        err,
      );
      process.exit(1);
    }
  }

  // write index.html
  try {
    await fs.writeFile(
      'index.html',
      template.html
        .toString()
        .replace(/_PORT_/gu, newArgs.port.toString() || argv.port.toString()),
    );
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
}
