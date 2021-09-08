import { createWriteStream } from 'fs';
import stripComments from 'strip-comments';
import { writeError } from '../../utils/misc';
import { Option, YargsArgs } from '../../types/yargs';

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

interface CloseStreamArgs {
  bundleError: Error;
  bundleBuffer: Buffer;
  bundleStream: NodeJS.WritableStream;
  src: string;
  dest: string;
  resolve: (value: boolean) => void;
  argv: YargsArgs;
}

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
