import type { LoaderDefinitionFunction } from 'webpack';
import type { LegacyOptions } from '../../config';
/**
 * A Browserify loader for Webpack. This exists for backwards compatibility with
 * the legacy configuration format, in order to support the `bundlerCustomizer`
 * function.
 *
 * When this loader is used, the input file will be processed by Browserify, and
 * written to disk by Webpack. Most processing will be handled by Browserify, so
 * there are no benefits like tree-shaking.
 *
 * @param content - The input file contents as a string.
 * @param sourceMap - The source map of the input file.
 */
declare const loader: LoaderDefinitionFunction<LegacyOptions>;
export default loader;
