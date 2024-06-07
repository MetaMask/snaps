import { coerce, string } from '@metamask/superstruct';
import { resolve } from 'path';

/**
 * A wrapper of `superstruct`'s `string` struct that coerces a value to a string
 * and resolves it relative to the current working directory. This is useful
 * for specifying file paths in a configuration file, as it allows the user to
 * use both relative and absolute paths.
 *
 * @returns The `superstruct` struct, which validates that the value is a
 * string, and resolves it relative to the current working directory.
 * @example
 * ```ts
 * const config = struct({
 *   file: file(),
 *   // ...
 * });
 *
 * const value = create({ file: 'path/to/file' }, config);
 * console.log(value.file); // /process/cwd/path/to/file
 * ```
 */
export function file() {
  return coerce(string(), string(), (value) => {
    return resolve(process.cwd(), value);
  });
}
