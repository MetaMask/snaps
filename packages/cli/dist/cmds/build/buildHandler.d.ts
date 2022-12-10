import { YargsArgs } from '../../types/yargs';
/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - Argv from Yargs.
 * @param argv.src - The source file path.
 * @param argv.dist - The output directory path.
 * @param argv.outfileName - The output file name.
 */
export declare function build(argv: YargsArgs): Promise<void>;
