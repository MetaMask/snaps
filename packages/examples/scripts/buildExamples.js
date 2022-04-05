const { promises: fs } = require('fs');
const { resolve: pathResolve } = require('path');

const execa = require('execa');

const SNAPS_CLI_BIN_PATH = '../../../cli/dist/main.js';

const EXAMPLES_PATH = 'examples';

buildExamples();

async function buildExamples() {
  const examplesDir = await fs.readdir(EXAMPLES_PATH);

  await Promise.all(
    examplesDir.map(async (exampleFile) => {
      const exampleFilePath = pathResolve(EXAMPLES_PATH, exampleFile);
      const exampleFileStat = await fs.stat(exampleFilePath);

      if (exampleFileStat.isDirectory()) {
        const srcPath = pathResolve(exampleFilePath, 'src/index.js');
        const pkgPath = pathResolve(exampleFilePath, 'package.json');
        const pkgStat = await fs.stat(pkgPath);
        const srcStat = await fs.stat(srcPath);

        if (pkgStat.isFile() && srcStat.isFile()) {
          try {
            // install dependencies
            await execa('yarn', ['install'], {
              cwd: exampleFilePath,
            });
          } catch (depsInstallError) {
            console.error(
              `Unexpected error when installing dependencies in "${exampleFilePath}.`,
            );
            throw depsInstallError;
          }

          // Some examples needs certain operations to run before it can be built
          try {
            await execa('yarn', ['prebuild'], {
              cwd: exampleFilePath,
            });
          } catch (err) {
            if (!err.message.includes('Command "prebuild" not found')) {
              console.error(
                `Unexpected error when running prebuild in "${exampleFilePath}.`,
              );
              throw err;
            }
          }

          try {
            await execa(
              'node',
              [
                pathResolve(exampleFilePath, SNAPS_CLI_BIN_PATH),
                'build',
                '--sourceMaps',
                '--stripComments',
              ],
              {
                cwd: exampleFilePath,
              },
            );
          } catch (bundleError) {
            console.error(
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
    }),
  );
}
