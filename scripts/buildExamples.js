
const { promises: fs } = require('fs');
const path = require('path');

const { bundle } = require('../src/build');

const EXAMPLES_PATH = 'examples';

fs.readdir(EXAMPLES_PATH, (err, results) => {

  if (err) {
    throw err;
  }

  results.forEach((examplesFile) => {

    let exampleFile = examplesFiles;
    exampleFile = path.resolve(EXAMPLES_PATH, examplesFile);

    fs.stat(exampleFile, (error, stat) => {

      if (error) {
        throw error;
      }

      if (stat?.isDirectory()) {

        try {

          const srcPath = path.resolve(exampleFile, 'index.js');
          const pkgPath = path.resolve(exampleFile, 'package.json');
          const pkgStat = await fs.stat(pkgPath);
          const srcStat = await fs.stat(srcPath);

          if (pkgStat?.isFile() && srcStat?.isFile()) {
            bundle(
              srcPath,
              path.resolve(exampleFile, 'dist/bundle.js'),
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
  });
});
