const { promises: fs } = require('fs');
const { resolve } = require('path');

const execa = require('execa');

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
          await execa('yarn', ['install'], {
            cwd: exampleFilePath,
          });
        } catch (depsInstallError) {
          console.error(
            `Unexpected error when installing dependencies in "${exampleFilePath}.`,
          );
          throw depsInstallError;
        }

        try {
          await execa('mm-snap', ['build', '--sourceMaps', '--stripComments'], {
            cwd: exampleFilePath,
          });
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
  });
}
