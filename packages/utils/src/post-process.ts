import { getAST, getCode, postProcessAST } from './ast';

export type PostProcessOptions = {
  stripComments: boolean;
};

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
 * @returns The post-processed bundle string.
 */
export function postProcessBundle(
  bundleString: string | null,
  { stripComments = true }: Partial<PostProcessOptions> = {},
): string | null {
  if (typeof bundleString !== 'string') {
    return null;
  }

  const ast = getAST(bundleString, !stripComments);
  const processedAST = postProcessAST(ast);
  const processedString = getCode(processedAST, bundleString);

  if (processedString.length === 0) {
    throw new Error(`Bundled code is empty after postprocessing.`);
  }

  return processedString;
}
