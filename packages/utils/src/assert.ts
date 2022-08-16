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
