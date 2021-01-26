const { promises: fs } = require('fs');
const path = require('path');
const execa = require('execa');

const { handler: build } = require('../src/cmds/build');

// mock the snaps global
global.snaps = {};

const EXAMPLES_PATH = 'examples';

buildExamples();

async function buildExamples() {
  const examplesDir = await fs.readdir(EXAMPLES_PATH);

  examplesDir.forEach(async (exampleFile) => {
    const exampleFilePath = path.resolve(EXAMPLES_PATH, exampleFile);
    const exampleFileStat = await fs.stat(exampleFilePath);

    if (exampleFileStat.isDirectory()) {
      const srcPath = path.resolve(exampleFilePath, 'index.js');
      const pkgPath = path.resolve(exampleFilePath, 'package.json');
      const pkgStat = await fs.stat(pkgPath);
      const srcStat = await fs.stat(srcPath);

      if (pkgStat.isFile() && srcStat.isFile()) {
        try {
          // install dependencies
          await execa('yarn', [], {
            cwd: exampleFilePath,
          });
        } catch (depsInstallError) {
          console.log(`Unexpected error when installing dependences in "${exampleFilePath}.`);
          throw depsInstallError;
        }

        try {
          await build({
            src: srcPath,
            dist: path.resolve(exampleFilePath, 'dist'),
            sourceMaps: true,
          });
        } catch (bundleError) {
          console.log(`Unexpected error while creating bundle in "${exampleFilePath}.`);
          throw bundleError;
        }
      } else {
        throw new Error(`Invalid example directory "${exampleFile}". Ensure it has valid 'package.json' and 'index.js' files.`);
      }
    }
  });
}
