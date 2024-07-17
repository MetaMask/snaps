import type { LoaderDefinitionFunction } from 'webpack';
/**
 * Options for the function loader.
 */
export declare type FunctionLoaderOptions = {
    /**
     * The function to execute. This is bound to the loader context, so it can
     * access the loader options and other properties.
     */
    fn: LoaderDefinitionFunction;
};
/**
 * A loader that executes a function. See {@link getFunctionLoader} for more
 * information.
 *
 * @param content - The input file contents as a `Uint8Array`.
 * @returns The output of the function.
 */
declare const loader: LoaderDefinitionFunction<FunctionLoaderOptions>;
export default loader;
/**
 * Get a loader that executes the given function. This is useful for executing
 * loaders without needing to pass a file to Webpack.
 *
 * @param fn - The function to execute.
 * @param options - The options to pass to the loader.
 * @returns The loader definition.
 */
export declare function getFunctionLoader<Options>(fn: LoaderDefinitionFunction<Options>, options: Options): {
    loader: string;
    options: {
        fn: LoaderDefinitionFunction<Options, {}>;
    } & Options;
};
