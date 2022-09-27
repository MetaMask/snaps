import { Struct, assert as assertSuperstruct } from 'superstruct';

export class AssertionError extends Error {
  constructor(options: { message: string }) {
    super(options.message);
  }

  code = 'ERR_ASSERTION' as const;
}

/**
 * Same as Node.js assert.
 * If the value is falsy, throws an error, does nothing otherwise.
 *
 * @throws {@link AssertionError}. If value is false.
 * @param value - The test that should be truthy to pass.
 * @param message - Message to be passed to {@link AssertionError} or an {@link Error} instance to throw.
 */
export function assert(value: any, message?: string | Error): asserts value {
  if (!value) {
    if (message instanceof Error) {
      throw message;
    }

    throw new AssertionError({ message: message ?? 'Assertion failed' });
  }
}

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

/* istanbul ignore next */
/**
 * Use in the default case of a switch that you want to be fully exhaustive.
 * Using this function forces the compiler to enforce exhaustivity during compile-time.
 *
 * @example
 * ```
 * const snapPrefix = snapIdToSnapPrefix(snapId);
 * switch (snapPrefix) {
 *   case SnapIdPrefixes.local:
 *     ...
 *   case SnapIdPrefixes.npm:
 *     ...
 *   default:
 *     assertExhaustive(snapPrefix);
 * }
 * ```
 * @param _object - The object on which the switch is being operated.
 */
export function assertExhaustive(_object: never): never {
  throw new Error(
    'Invalid branch reached. Should be detected during compilation',
  );
}
