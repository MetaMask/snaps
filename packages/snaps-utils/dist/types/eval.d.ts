export declare type EvalOutput = {
    stdout: string;
    stderr: string;
};
export declare class SnapEvalError extends Error {
    readonly output: EvalOutput;
    constructor(message: string, output: EvalOutput);
}
/**
 * Spawn a new process to run the provided bundle in.
 *
 * @param bundlePath - The path to the bundle to run.
 * @returns `null` if the worker ran successfully.
 * @throws If the worker failed to run successfully.
 */
export declare function evalBundle(bundlePath: string): Promise<EvalOutput>;
