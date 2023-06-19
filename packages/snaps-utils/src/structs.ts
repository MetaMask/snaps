import {
  Struct,
  StructError,
  define,
  literal as superstructLiteral,
  Failure,
  create,
} from 'superstruct';

/**
 * A wrapper of `superstruct`'s `literal` struct that also defines the name of
 * the struct as the literal value.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 * For example, instead of returning an error like:
 *
 * ```
 * Expected the value to satisfy a union of `literal | literal`, but received: \"baz\"
 * ```
 *
 * This struct will return an error like:
 *
 * ```
 * Expected the value to satisfy a union of `"foo" | "bar"`, but received: \"baz\"
 * ```
 *
 * @param value - The literal value.
 * @returns The `superstruct` struct, which validates that the value is equal
 * to the literal value.
 */
export function literal<Type extends string | number>(value: Type) {
  return define<Type>(
    JSON.stringify(value),
    superstructLiteral(value).validator,
  );
}

export class SnapsStructError extends StructError {
  constructor(
    prefix: string,
    suffix: string,
    failure: StructError,
    failures: () => Generator<Failure>,
  ) {
    super(failure, failures);

    this.name = 'SnapsStructError';
    this.message = `${prefix}: ${failure.message}.${
      suffix ? ` ${suffix}` : ''
    }`;
  }
}

type GetErrorOptions = {
  prefix: string;
  suffix?: string;
  error: StructError;
};

/**
 * Converts an array to a generator function that yields the items in the
 * array.
 *
 * @param array - The array.
 * @returns A generator function.
 * @yields The items in the array.
 */
function* arrayToGenerator<Type>(
  array: Type[],
): Generator<Type, void, undefined> {
  for (const item of array) {
    yield item;
  }
}

/**
 * Returns a `SnapsStructError` with the given prefix and suffix.
 *
 * @param options - The options.
 * @param options.prefix - The prefix to add to the error message.
 * @param options.suffix - The suffix to add to the error message. Defaults to
 * an empty string.
 * @param options.error - The `superstruct` error to wrap.
 * @returns The `SnapsStructError`.
 */
function getError({ prefix, suffix = '', error }: GetErrorOptions) {
  return new SnapsStructError(prefix, suffix, error, () =>
    arrayToGenerator(error.failures()),
  );
}

/**
 * A wrapper of `superstruct`'s `create` function that throws a
 * `SnapsStructError` instead of a `StructError`. This is useful for improving
 * the error messages returned by `superstruct`.
 *
 * @param value - The value to validate.
 * @param struct - The `superstruct` struct to validate the value against.
 * @param prefix - The prefix to add to the error message.
 * @param suffix - The suffix to add to the error message. Defaults to an empty
 * string.
 * @returns The validated value.
 */
export function createFromStruct<Type>(
  value: unknown,
  struct: Struct<Type>,
  prefix: string,
  suffix = '',
) {
  try {
    return create(value, struct);
  } catch (error) {
    if (error instanceof StructError) {
      throw getError({ prefix, suffix, error });
    }

    throw error;
  }
}
