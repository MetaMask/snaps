const { promises: fs } = require('fs');
const path = require('path');

const { bundle } = require('../src/build');

const EXAMPLES_PATH = 'examples';

buildExamples();

async function buildExamples() {
  const examplesDir = await fs.readdir(EXAMPLES_PATH);

  examplesDir.forEach(async (exampleFile) => {
    const exampleFilePath = path.resolve(EXAMPLES_PATH, exampleFile);
    const exampleFileStat = await fs.stat(exampleFilePath);

    if (exampleFileStat.isDirectory()) {
      try {
        const srcPath = path.resolve(exampleFilePath, 'index.js');
        const pkgPath = path.resolve(exampleFilePath, 'package.json');
        const pkgStat = await fs.stat(pkgPath);
        const srcStat = await fs.stat(srcPath);

        if (pkgStat.isFile() && srcStat.isFile()) {
          bundle(
            srcPath,
            path.resolve(exampleFilePath, 'dist/bundle.js'),
            { sourceMaps: true },
          );
        } else {
          throw new Error();
        }
      } catch (errors) {
        console.log(`Invalid example folder found: ${exampleFile}`);
        console.log(`Ensure it has valid 'package.json' and 'index.js' files.`);
      }
    }
  });
}
