import type { Ora } from 'ora';
export declare type Step<Context extends Record<string, unknown>> = {
    name: string;
    condition?: (context: Context) => boolean;
    task: (context: Context & {
        spinner: Ora;
    }) => Promise<void>;
};
export declare type Steps<Context extends Record<string, unknown>> = Readonly<Step<Context>[]>;
/**
 * Execute a list of steps in series. Each step receives the context object and
 * a spinner instance.
 *
 * @param steps - The steps to execute.
 * @param context - The context object that will be passed to each step.
 */
export declare function executeSteps<Context extends Record<string, unknown>>(steps: Steps<Context>, context: Context): Promise<void>;
