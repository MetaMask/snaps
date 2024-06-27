import type { Options, PositionalOptions } from 'yargs';
export declare type SnapsCliBuilders = {
    readonly verboseErrors: Readonly<Options>;
    readonly directory: Readonly<PositionalOptions>;
};
declare const builders: SnapsCliBuilders;
export default builders;
