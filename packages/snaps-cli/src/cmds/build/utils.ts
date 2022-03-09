import { promises as fs } from 'fs';
import stripComments from '@nodefactory/strip-comments';
import { writeError } from '../../utils/misc';
import { Option, YargsArgs } from '../../types/yargs';
import { TranspilationModes } from '../../builders';

type WriteBundleFileArgs = {
  bundleError: Error;
  bundleBuffer: Buffer;
  src: string;
  dest: string;
  resolve: (value: boolean) => void;
  argv: YargsArgs;
};

/**
 * Performs postprocessing on the bundle contents and writes them to disk.
 * Intended to be used in the callback passed to the Browserify `.bundle()`
 * call.
 *
 * @param options - Options bag.
 * @param options.bundleError - Any error received from Browserify.
 * @param options.bundleBuffer - The {@link Buffer} with the bundle contents
 * from Browserify.
 * @param options.src - The source file path.
 * @param options.dest - The destination file path.
 * @param options.resolve - A {@link Promise} resolution function, so that we
 * can use promises and `async`/`await` even though Browserify uses callbacks.
 * @param options.argv - The Yargs `argv` object.
 */
export async function writeBundleFile({
  bundleError,
  bundleBuffer,
  src,
  dest,
  resolve,
  argv,
}: WriteBundleFileArgs) {
  if (bundleError) {
    await writeError('Build error:', bundleError.message, bundleError);
  }

  try {
    await fs.writeFile(
      dest,
      postProcess(bundleBuffer ? bundleBuffer.toString() : null, {
        stripComments: argv.stripComments,
        transformHtmlComments: argv.transformHtmlComments,
      }) as string,
    );

    if (bundleBuffer) {
      console.log(`Build success: '${src}' bundled as '${dest}'!`);
    }
    resolve(true);
  } catch (error) {
    await writeError('Write error:', error.message, error, dest);
  }
}

/**
 * Postprocesses a JavaScript bundle string such that it can be evaluated in SES.
 * Currently:
 * - converts certain dot notation to string notation (for indexing)
 * - makes all direct calls to eval indirect
 * - wraps original bundle in anonymous function
 * - handles certain Babel-related edge cases
 *
 * @param bundleString - The bundle string
 * @param options - post process options
 * @param options.stripComments
 * @returns - The postprocessed bundle string
 */
export function postProcess(
  bundleString: string | null,
  options: Partial<Option> = {},
): string | null {
  if (typeof bundleString !== 'string') {
    return null;
  }

  let processedString = bundleString.trim();

  if (options.stripComments) {
    // TODO: Upstream a better fix to @nodefactory/strip-comments
    // The strip-comments package has issues with block comments of the
    // following forms, and so we remove them manually first:
    //   /**/
    //   /***/
    processedString = processedString.replace(/\/\*\**\*\//gu, '');

    processedString = stripComments(processedString);
  }

  // Break up tokens that could be parsed as HTML comment terminators.
  // The regular expressions below are written strangely so as to avoid the
  // appearance of such tokens in our source code.
  // Ref: https://github.com/endojs/endo/blob/70cc86eb400655e922413b99c38818d7b2e79da0/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
  // This aggressive hack may change the behavior of programs that contain HTML
  // comment terminators in string literals.
  if (options.transformHtmlComments) {
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

/**
 * Processes dependencies and updates argv with an options object
 * @param argv
 */
export function processDependencies(argv: YargsArgs) {
  const { depsToTranspile, transpilationMode } = argv;
  const babelifyOptions: Record<string, any> = {};
  if (transpilationMode === TranspilationModes.localAndDeps) {
    const regexpStr = getDependencyRegExp(depsToTranspile as string[]);
    if (regexpStr !== null) {
      babelifyOptions.ignore = [regexpStr];
    }
  }
  return babelifyOptions;
}

/**
 * Processes a string of space delimited dependencies into one regex string
 * @param dependencies
 * @returns a regexp string
 */
export function getDependencyRegExp(dependencies: string[]): RegExp | null {
  let regexp: string | null = null;
  if (!dependencies || dependencies.includes('.') || !dependencies.length) {
    return regexp;
  }
  const paths: string[] = sanitizeDependencyPaths(dependencies);
  regexp = `/node_modules/(?!${paths.shift()}`;
  paths.forEach((path) => (regexp += `|${path}`));
  regexp += '/)';
  return RegExp(regexp, 'u');
}

/**
 * Helper function remove any leading and trailing slashes from dependency list
 * @param dependencies
 * @returns an array of sanitized paths
 */
export function sanitizeDependencyPaths(dependencies: string[]): string[] {
  return dependencies.map((dependency) => {
    return dependency.replace(/^[/\\]+/u, '').replace(/[/\\]+$/u, '');
  });
}

export function processInvalidTranspilation(argv: YargsArgs) {
  if (
    argv.depsToTranspile &&
    argv.transpilationMode !== TranspilationModes.localAndDeps
  ) {
    throw new Error(
      '"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps" .',
    );
  }
}
