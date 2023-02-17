const { readFile, writeFile } = require('fs/promises');
const { resolve, dirname } = require('path');

main();

/**
 * Inlines SES in a script tag before the iframe executor bundle.
 * This is required due to a Chromium bug/quirk that prevents `unhandledrejection` from firing inside a sandboxed iframe if the origin of the error in an external file.
 */
async function main() {
  process.argv
    .slice(2)
    .map((path) => resolve(path))
    .forEach(async (path) => {
      const file = await readFile(path);

      const fileAsString = file.toString();

      const sesPath = resolve(
        `${dirname(require.resolve('ses/package.json'))}`,
        'dist',
        'lockdown.umd.min.js',
      );

      const ses = (await readFile(sesPath)).toString();

      const replaced = fileAsString.replace(/%SES%/gu, () => ses);

      await writeFile(path, replaced);
    });
}
