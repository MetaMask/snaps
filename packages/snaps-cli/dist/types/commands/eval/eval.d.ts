import type { ProcessedConfig } from '../../config';
export declare type EvalOptions = {
    input?: string;
};
export declare type EvalContext = Required<EvalOptions>;
/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param config - The processed config object.
 * @param options - The eval options.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export declare function evaluateHandler(config: ProcessedConfig, options?: EvalOptions): Promise<void>;
