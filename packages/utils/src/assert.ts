import { AssertionError } from '@metamask/utils';
import { Struct, assert as assertSuperstruct } from 'superstruct';

/**
 * Assert a value against a Superstruct struct.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @param errorPrefix - A prefix to add to the error message. Defaults to
 * "Assertion failed".
 * @throws If the value is not valid.
 */
export function assertStruct<T, S>(
  value: unknown,
  struct: Struct<T, S>,
  errorPrefix = 'Assertion failed',
): asserts value is T {
  try {
    assertSuperstruct(value, struct);
  } catch (error) {
    throw new AssertionError({
      message: `${errorPrefix}: ${error.message}`,
    });
  }
}
