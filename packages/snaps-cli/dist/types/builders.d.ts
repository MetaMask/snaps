import type { Options } from 'yargs';
export declare enum TranspilationModes {
    LocalAndDeps = "localAndDeps",
    LocalOnly = "localOnly",
    None = "none"
}
declare const builders: Record<string, Readonly<Options>>;
export default builders;
