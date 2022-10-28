import { AssertionError } from '@metamask/utils';
import { Struct, assert as assertSuperstruct } from 'superstruct';

export type AssertionErrorConstructor =
  | (new (args: { message: string }) => Error)
  | ((args: { message: string }) => Error);

/**
 * Check if a value is a constructor.
 *
 * @param fn - The value to check.
 * @returns `true` if the value is a constructor, or `false` otherwise.
 */
function isConstructable(
  fn: AssertionErrorConstructor,
): fn is new (args: { message: string }) => Error {
  return Boolean(typeof fn?.prototype?.constructor?.name === 'string');
}

/**
 * Check if a value is not a constructor.
 *
 * @param fn - The value to check.
 * @returns `true` if the value is not a constructor, or `false` otherwise.
 */
function isNotConstructable(
  fn: AssertionErrorConstructor,
): fn is (args: { message: string }) => Error {
  return !isConstructable(fn);
}

/**
 * Assert a value against a Superstruct struct.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @param errorPrefix - A prefix to add to the error message. Defaults to
 * "Assertion failed".
 * @param ErrorWrapper - The error class to throw if the assertion fails.
 * Defaults to {@link AssertionError}.
 * @throws If the value is not valid.
 */
export function assertStruct<T, S>(
  value: unknown,
  struct: Struct<T, S>,
  errorPrefix = 'Assertion failed',
  ErrorWrapper: AssertionErrorConstructor = AssertionError,
): asserts value is T {
  try {
    assertSuperstruct(value, struct);
  } catch (error) {
    if (isConstructable(ErrorWrapper)) {
      throw new ErrorWrapper({
        message: `${errorPrefix}: ${error.message}.`,
      });
    }

    if (isNotConstructable(ErrorWrapper)) {
      throw ErrorWrapper({
        message: `${errorPrefix}: ${error.message}.`,
      });
    }

    // This should never happen, but TypeScript doesn't know that.
    /* istanbul ignore next */
    throw error;
  }
}
