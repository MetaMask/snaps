import type { LoaderDefinitionFunction } from 'webpack';

/**
 * Options for the function loader.
 */
export type FunctionLoaderOptions = {
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
// TODO: Either fix this lint violation or explain why it's necessary to ignore.
// eslint-disable-next-line @typescript-eslint/promise-function-async
const loader: LoaderDefinitionFunction<FunctionLoaderOptions> = function (
  content,
) {
  const { fn } = this.getOptions();
  return fn.bind(this)(content);
};

export default loader;

// By setting `raw` to `true`, we are telling Webpack to provide the source as a
// `Uint8Array` instead of converting it to a string. This allows us to avoid
// having to convert the source back to a `Uint8Array` in the loader.
export const raw = true;

/**
 * Get a loader that executes the given function. This is useful for executing
 * loaders without needing to pass a file to Webpack.
 *
 * @param fn - The function to execute.
 * @param options - The options to pass to the loader.
 * @returns The loader definition.
 */
export function getFunctionLoader<Options>(
  fn: LoaderDefinitionFunction<Options>,
  options: Options,
) {
  return {
    // We use `__filename` as the loader, so Webpack will execute the loader in
    // this file, with the actual function in the options.
    loader: __filename,
    options: {
      fn,
      ...options,
    },
  };
}
