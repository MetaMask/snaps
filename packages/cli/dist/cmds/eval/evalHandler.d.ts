import { YargsArgs } from '../../types/yargs';
/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param argv - The Yargs arguments object.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export declare function evalHandler(argv: YargsArgs): Promise<void>;
