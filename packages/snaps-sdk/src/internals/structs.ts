import type { Infer } from 'superstruct';
import {
  Struct,
  define,
  literal as superstructLiteral,
  union as superstructUnion,
} from 'superstruct';
import type { AnyStruct, InferStructTuple } from 'superstruct/dist/utils';

import type { EnumToUnion } from './helpers';

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
export function literal<Type extends string | number | boolean>(value: Type) {
  return define<Type>(
    JSON.stringify(value),
    superstructLiteral(value).validator,
  );
}

/**
 * A wrapper of `superstruct`'s `union` struct that also defines the schema as
 * the union of the schemas of the structs.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 *
 * @param structs - The structs to union.
 * @param structs."0" - The first struct.
 * @param structs."1" - The remaining structs.
 * @returns The `superstruct` struct, which validates that the value satisfies
 * one of the structs.
 */
export function union<Head extends AnyStruct, Tail extends AnyStruct[]>([
  head,
  ...tail
]: [head: Head, ...tail: Tail]): Struct<
  Infer<Head> | InferStructTuple<Tail>[number],
  [head: Head, ...tail: Tail]
> {
  const struct = superstructUnion([head, ...tail]);

  return new Struct({
    ...struct,
    schema: [head, ...tail],
  });
}

/**
 * Superstruct struct for validating an enum value. This allows using both the
 * enum string values and the enum itself as values.
 *
 * @param constant - The enum to validate against.
 * @returns The superstruct struct.
 */
export function enumValue<Type extends string>(
  constant: Type,
): Struct<EnumToUnion<Type>, null> {
  return literal(constant as EnumToUnion<Type>);
}
