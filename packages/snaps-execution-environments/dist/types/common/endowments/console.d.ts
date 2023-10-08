import type { EndowmentFactoryOptions } from './commonEndowmentFactory';
export declare const consoleAttenuatedMethods: Set<string>;
/**
 * A set of all the `console` values that will be passed to the snap. This has
 * all the values that are available in both the browser and Node.js.
 */
export declare const consoleMethods: Set<string>;
/**
 * Create a a {@link console} object, with the same properties as the global
 * {@link console} object, but with some methods replaced.
 *
 * @param options - Factory options used in construction of the endowment.
 * @param options.snapId - The id of the snap that will interact with the endowment.
 * @returns The {@link console} object with the replaced methods.
 */
declare function createConsole({ snapId }?: EndowmentFactoryOptions): {
    console: {
        error: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        log: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        warn: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        debug: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        info: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        assert: (value: any, message?: string | undefined, ...optionalParams: any[]) => void;
    };
};
declare const endowmentModule: {
    names: readonly ["console"];
    factory: typeof createConsole;
};
export default endowmentModule;
