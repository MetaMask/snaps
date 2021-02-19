import chokidar from 'chokidar';
import yargs from 'yargs';
import builders from '../../builders';
import { bundle } from '../build/bundle';
import { logError, getOutfilePath, validateDirPath, validateFilePath, validateOutfileName } from '../../utils';
import { YargsArgs } from '../../types/yargs';

module.exports.command = ['watch', 'w'];
module.exports.desc = 'Build Snap on change';
module.exports.builder = (yarg: yargs.Argv) => {
  yarg
    .option('src', builders.src)
    .option('dist', builders.dist)
    .option('outfileName', builders.outfileName)
    .option('sourceMaps', builders.sourceMaps)
    .option('stripComments', builders.stripComments);
};
module.exports.handler = (argv: YargsArgs) => watch(argv);

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - arguments as an object generated by yargs
 * @param argv.src - The source file path
 * @param argv.dist - The output directory path
 * @param argv.'outfileName' - The output file name
 */
async function watch(argv: YargsArgs): Promise<void> {

  const { src, dist, outfileName } = argv;
  if (outfileName) {
    validateOutfileName(outfileName as string);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);
  const root = (
    src.indexOf('/') === -1 ? '.' : src.substring(0, src.lastIndexOf('/') + 1)
  );
  const outfilePath = getOutfilePath(dist, outfileName as string);

  const watcher = chokidar.watch(root, {
    ignoreInitial: true,
    ignored: [
      '**/node_modules/**',
      `**/${dist}/**`,
      `**/test/**`,
      `**/tests/**`,
      (str: string) => str !== '.' && str.startsWith('.'),
    ],
  });

  watcher
    .on('ready', () => {
      bundle(src, outfilePath, argv);
    })
    .on('add', (path: string) => {
      console.log(`File added: ${path}`);
      bundle(src, outfilePath, argv);
    })
    .on('change', (path: string) => {
      console.log(`File changed: ${path}`);
      bundle(src, outfilePath, argv);
    })
    .on('unlink', (path: string) => console.log(`File removed: ${path}`))
    .on('error', (err: Error) => {
      logError(`Watcher error: ${err.message}`, err);
    });

  watcher.add(`${root}`);
  console.log(`Watching '${root}' for changes...`);
}
