import { Options, PositionalOptions } from 'yargs';
export declare type SnapsCliBuilders = {
    readonly bundle: Readonly<Options>;
    readonly dist: Readonly<Options>;
    readonly eval: Readonly<Options>;
    readonly manifest: Readonly<Options>;
    readonly outfileName: Readonly<Options>;
    readonly port: Readonly<Options>;
    readonly root: Readonly<Options>;
    readonly sourceMaps: Readonly<Options>;
    readonly src: Readonly<Options>;
    readonly stripComments: Readonly<Options>;
    readonly suppressWarnings: Readonly<Options>;
    readonly transpilationMode: Readonly<Options>;
    readonly depsToTranspile: Readonly<Options>;
    readonly verboseErrors: Readonly<Options>;
    readonly writeManifest: Readonly<Options>;
    readonly serve: Readonly<Options>;
    readonly directory: Readonly<PositionalOptions>;
};
export declare enum TranspilationModes {
    localAndDeps = "localAndDeps",
    localOnly = "localOnly",
    none = "none"
}
declare const builders: SnapsCliBuilders;
export default builders;
