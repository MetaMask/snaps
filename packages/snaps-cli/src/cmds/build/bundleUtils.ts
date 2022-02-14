import { createWriteStream } from 'fs';
import stripComments from '@nodefactory/strip-comments';
import { writeError } from '../../utils/misc';
import { Option, YargsArgs } from '../../types/yargs';
import { TranspilationModes } from '../../builders';

/**
 * Opens a stream to write the destination file path.
 *
 * @param dest - The output file path
 * @returns - The stream
 */
export function createBundleStream(dest: string): NodeJS.WritableStream {
  const stream = createWriteStream(dest, {
    autoClose: false,
    encoding: 'utf8',
  });
  stream.on('error', (err) => {
    writeError('Write error:', err.message, err, dest);
  });
  return stream;
}

type CloseStreamArgs = {
  bundleError: Error;
  bundleBuffer: Buffer;
  bundleStream: NodeJS.WritableStream;
  src: string;
  dest: string;
  resolve: (value: boolean) => void;
  argv: YargsArgs;
};

/**
 * Postprocesses the bundle string and closes the write stream.
 *
 * @param stream - The write stream
 * @param bundleString - The bundle string
 * @param options - post process options
 * @param options.stripComments
 */
export async function closeBundleStream({
  bundleError,
  bundleBuffer,
  bundleStream,
  src,
  dest,
  resolve,
  argv,
}: CloseStreamArgs) {
  if (bundleError) {
    await writeError('Build error:', bundleError.message, bundleError);
  }

  try {
    bundleStream.end(
      postProcess(bundleBuffer ? bundleBuffer.toString() : null, {
        stripComments: argv.stripComments,
      }) as string,
    );

    if (bundleBuffer) {
      console.log(`Build success: '${src}' bundled as '${dest}'!`);
    }
    resolve(true);
  } catch (closeError) {
    await writeError('Write error:', closeError.message, closeError, dest);
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
    processedString = stripComments(processedString);
  }

  // stuff.eval(otherStuff) => (1, stuff.eval)(otherStuff)
  processedString = processedString.replace(
    /((?:\b[\w\d]*[\])]?\.)+eval)(\([^)]*\))/gu,
    '(1, $1)$2',
  );

  // if we don't do the above, the below causes syntax errors if it encounters
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
    return /\/node_modules\/(?!.+)/u;
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
  if (!dependencies.length) {
    return ['.'];
  }
  return dependencies.map((dependency) => {
    return dependency.replace(/^[/\\]+/u, '').replace(/[/\\]+$/u, '');
  });
}
