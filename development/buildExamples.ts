import { promises as fs } from 'fs';
import { resolve } from 'path';
import execa from 'execa';

import { build } from '../src/cmds/build';
import { SnapsCliGlobals } from '../src/types/package';

// mock the snaps global
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Global extends SnapsCliGlobals {}
  }
}

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

const EXAMPLES_PATH = 'examples';

buildExamples();

async function buildExamples() {
  const examplesDir = await fs.readdir(EXAMPLES_PATH);

  examplesDir.forEach(async (exampleFile) => {
    const exampleFilePath = resolve(EXAMPLES_PATH, exampleFile);
    const exampleFileStat = await fs.stat(exampleFilePath);

    if (exampleFileStat.isDirectory()) {
      const srcPath = resolve(exampleFilePath, 'index.js');
      const pkgPath = resolve(exampleFilePath, 'package.json');
      const pkgStat = await fs.stat(pkgPath);
      const srcStat = await fs.stat(srcPath);

      if (pkgStat.isFile() && srcStat.isFile()) {
        try {
          // install dependencies
          await execa('yarn', [], {
            cwd: exampleFilePath,
          });
        } catch (depsInstallError) {
          console.log(
            `Unexpected error when installing dependences in "${exampleFilePath}.`,
          );
          throw depsInstallError;
        }

        try {
          await build({
            src: srcPath,
            dist: resolve(exampleFilePath, 'dist'),
            sourceMaps: true,
            stripComments: true,
            port: 8000,
          });
        } catch (bundleError) {
          console.log(
            `Unexpected error while creating bundle in "${exampleFilePath}.`,
          );
          throw bundleError;
        }
      } else {
        throw new Error(
          `Invalid example directory "${exampleFile}". Ensure it has valid 'package.json' and 'index.js' files.`,
        );
      }
    }
  });
}
