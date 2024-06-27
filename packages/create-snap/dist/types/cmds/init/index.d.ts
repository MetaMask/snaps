import type yargs from 'yargs';
import type { YargsArgs } from '../../types/yargs';
export declare const initCommand: {
    command: string[];
    desc: string;
    builder: (yarg: yargs.Argv) => yargs.Argv<{}>;
    handler: typeof init;
};
/**
 * The main entrypoint for the init command. This calls the init handler to
 * initialize the snap package, builds the snap, and then updates the manifest
 * with the shasum of the built snap.
 *
 * @param argv - The Yargs arguments object.
 */
declare function init(argv: YargsArgs): Promise<void>;
export {};
