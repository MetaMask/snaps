/**
 * Source map declaration taken from `@babel/core`. Babel doesn't export the
 * type for this, so it's copied from the source code instead here.
 */
export declare type SourceMap = {
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string | undefined;
    sourcesContent?: string[] | undefined;
    mappings: string;
    file: string;
};
/**
 * The post process options.
 *
 * @property stripComments - Whether to strip comments. Defaults to `true`.
 * @property sourceMap - Whether to generate a source map for the modified code.
 * See also `inputSourceMap`.
 * @property inputSourceMap - The source map for the input code. When provided,
 * the source map will be used to generate a source map for the modified code.
 * This ensures that the source map is correct for the modified code, and still
 * points to the original source. If not provided, a new source map will be
 * generated instead.
 */
export declare type PostProcessOptions = {
    stripComments?: boolean;
    sourceMap?: boolean | 'inline';
    inputSourceMap?: SourceMap;
};
/**
 * The post processed bundle output.
 *
 * @property code - The modified code.
 * @property sourceMap - The source map for the modified code, if the source map
 * option was enabled.
 * @property warnings - Any warnings that occurred during the post-processing.
 */
export declare type PostProcessedBundle = {
    code: string;
    sourceMap?: SourceMap | null;
    warnings: PostProcessWarning[];
};
export declare enum PostProcessWarning {
    UnsafeMathRandom = "`Math.random` was detected in the bundle. This is not a secure source of randomness."
}
/**
 * Post process code with AST such that it can be evaluated in SES.
 *
 * Currently:
 * - Makes all direct calls to eval indirect.
 * - Handles certain Babel-related edge cases.
 * - Removes the `Buffer` provided by Browserify.
 * - Optionally removes comments.
 * - Breaks up tokens that would otherwise result in SES errors, such as HTML
 * comment tags `<!--` and `-->` and `import(n)` statements.
 *
 * @param code - The code to post process.
 * @param options - The post-process options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.sourceMap - Whether to generate a source map for the modified
 * code. See also `inputSourceMap`.
 * @param options.inputSourceMap - The source map for the input code. When
 * provided, the source map will be used to generate a source map for the
 * modified code. This ensures that the source map is correct for the modified
 * code, and still points to the original source. If not provided, a new source
 * map will be generated instead.
 * @returns An object containing the modified code, and source map, or null if
 * the provided code is null.
 */
export declare function postProcessBundle(code: string, { stripComments, sourceMap: sourceMaps, inputSourceMap, }?: Partial<PostProcessOptions>): PostProcessedBundle;
