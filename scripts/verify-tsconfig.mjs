import { promises as fs } from 'fs';
import pathUtils from 'path';
import { fileURLToPath } from 'url';

const cwd = pathUtils.dirname(fileURLToPath(import.meta.url))

// These are the packages we expect to _not_ be referenced in the root tsconfig.
const IGNORE_LIST = new Set(['examples', 'snaps-types', 'test-snaps']);

// Get reference paths from root tsconfig.json
const rootTsconfig = JSON.parse(await fs.readFile('./tsconfig.json', { encoding: 'utf8' }));
const rootTsconfigReferences = new Set(rootTsconfig.references.map(
  ({ path }) => path.split('/').pop()
))

// Get the names of all directories in the packages directory
const packagesPath = pathUtils.resolve(cwd, '../packages');
const packageDirNames = (await fs.readdir(packagesPath, { withFileTypes: true }))
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Any unreferenced package dirs must either be referenced or ignored
const unreferencedPackageDirs = packageDirNames.filter((name) => !rootTsconfigReferences.has(name) && !IGNORE_LIST.has(name))
if (unreferencedPackageDirs.length > 0) {
  throw new Error(`Found unreferenced package directories not in ignore list:\n\n\t${
    unreferencedPackageDirs.join('\n\t')
  }\n\nEither reference or ignore the packages to continue.`)
}
