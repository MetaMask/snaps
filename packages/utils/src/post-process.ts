import { stripComments as stripCommentsFn } from './strip';

export type PostProcessOptions = {
  stripComments: boolean;
  transformHtmlComments: boolean;
};

/**
 * Post-processes a JavaScript bundle string such that it can be evaluated in
 * SES.
 *
 * Currently:
 * - Converts certain dot notation to string notation (for indexing).
 * - Makes all direct calls to eval indirect.
 * - Wraps original bundle in anonymous function.
 * - Handles certain Babel-related edge cases.
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

  let processedString = bundleString.trim();

  if (stripComments) {
    processedString = stripCommentsFn(processedString);
  }

  // Break up tokens that could be parsed as HTML comment terminators.
  // The regular expressions below are written strangely so as to avoid the
  // appearance of such tokens in our source code.
  // Ref: https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
  // This aggressive hack may change the behavior of programs that contain HTML
  // comment terminators in string literals.
  if (transformHtmlComments) {
    processedString = processedString.replace(
      new RegExp(`<!${'--'}`, 'gu'),
      '< !--',
    );

    processedString = processedString.replace(
      new RegExp(`${'--'}>`, 'gu'),
      '-- >',
    );
  }

  // stuff.eval(otherStuff) => (1, stuff.eval)(otherStuff)
  processedString = processedString.replace(
    /((?:\b[\w\d]*[\])]?\.)+eval)(\([^)]*\))/gu,
    '(1, $1)$2',
  );

  // If we don't do the above, the below causes syntax errors if it encounters
  // things of the form: "something.eval(stuff)"
  // eval(stuff) => (1, eval)(stuff)
  processedString = processedString.replace(
    /(\b)(eval)(\([^)]*\))/gu,
    '$1(1, $2)$3',
  );

  // Browserify provides the Buffer global as an argument to modules that use
  // it, but this does not work in SES. Since we pass in Buffer as an endowment,
  // we can simply remove the argument.
  processedString = processedString.replace(
    /^\(function \(Buffer\)\{$/gmu,
    '(function (){',
  );

  if (processedString.length === 0) {
    throw new Error(`Bundled code is empty after postprocessing.`);
  }

  // handle some cases by declaring missing globals
  // Babel regeneratorRuntime
  if (processedString.indexOf('regeneratorRuntime') !== -1) {
    processedString = `var regeneratorRuntime;\n${processedString}`;
  }

  return processedString;
}
