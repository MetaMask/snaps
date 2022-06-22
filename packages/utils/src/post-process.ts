import { getAST, getCode, postProcessAST, PostProcessASTOptions } from './ast';

export type PostProcessOptions = PostProcessASTOptions;

/**
 * Post-processes a JavaScript bundle string such that it can be evaluated in
 * SES.
 *
 * Currently:
 * - Converts certain dot notation to string notation (for indexing).
 * - Makes all direct calls to eval indirect.
 * - Handles certain Babel-related edge cases.
 * - Removes the `Buffer` provided by Browserify.
 * - Optionally removes comments.
 *
 * @param bundleString - The bundle string.
 * @param options - The post-process options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.transformHtmlComments - Whether to transform HTML comments.
 * Defaults to `true`.
 * @returns The post-processed bundle string.
 */
export function postProcessBundle(
  bundleString: string | null,
  {
    stripComments = true,
    transformHtmlComments = true,
  }: Partial<PostProcessOptions> = {},
): string | null {
  if (typeof bundleString !== 'string') {
    return null;
  }

  const ast = getAST(bundleString);
  const processedAST = postProcessAST(ast, {
    stripComments,
    transformHtmlComments,
  });
  const processedString = getCode(processedAST);

  if (processedString.length === 0) {
    throw new Error(`Bundled code is empty after postprocessing.`);
  }

  return processedString;
}
