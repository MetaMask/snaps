import { YargsArgs } from '../../types/yargs';
/**
 * Creates a new snap package, based on one of the provided templates. This
 * creates all the necessary files, like `package.json`, `snap.config.js`, etc.
 * to start developing a snap.
 *
 * @param argv - The Yargs arguments object.
 * @returns The Yargs arguments augmented with the new `dist`, `outfileName` and
 * `src` properties.
 * @throws If initialization of the snap package failed.
 */
export declare function initHandler(argv: YargsArgs): Promise<{
    dist: string;
    outfileName: string;
    src: string;
    snapLocation: string;
    sourceMaps: boolean;
    stripComments: boolean;
    transformHtmlComments: boolean;
    port: number;
    eval: boolean;
    serve: boolean;
    directory?: string | undefined;
    _?: (string | number)[] | undefined;
    $0?: string | undefined;
}>;
