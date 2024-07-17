import type { AnyStruct, Infer, InferStructTuple } from '@metamask/superstruct';
import {
  Struct,
  define,
  is,
  literal as superstructLiteral,
  union as superstructUnion,
} from '@metamask/superstruct';
import { hasProperty, isPlainObject } from '@metamask/utils';

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

/**
 * Create a custom union struct that validates exclusively based on a `type` field.
 *
 * This should improve error messaging for unions with many structs in them.
 *
 * @param structs - The structs to union.
 * @returns The `superstruct` struct, which validates that the value satisfies
 * one of the structs.
 */
export function typedUnion<Head extends AnyStruct, Tail extends AnyStruct[]>(
  structs: [head: Head, ...tail: Tail],
): Struct<Infer<Head> | InferStructTuple<Tail>[number], null> {
  return new Struct({
    type: 'union',
    schema: null,
    *entries(value, context) {
      if (!isPlainObject(value) || !hasProperty(value, 'type')) {
        return;
      }

      const { type } = value;
      const struct = structs.find(({ schema }) => is(type, schema.type));

      if (!struct) {
        return;
      }

      for (const entry of struct.entries(value, context)) {
        yield entry;
      }
    },
    validator(value, context) {
      const types = structs.map(({ schema }) => schema.type.type);

      if (
        !isPlainObject(value) ||
        !hasProperty(value, 'type') ||
        typeof value.type !== 'string'
      ) {
        return `Expected type to be one of: ${types.join(
          ', ',
        )}, but received: undefined`;
      }

      const { type } = value;

      const struct = structs.find(({ schema }) => is(type, schema.type));

      if (struct) {
        // This only validates the root of the struct, entries does the rest of the work.
        return struct.validator(value, context);
      }

      return `Expected type to be one of: ${types.join(
        ', ',
      )}, but received: "${type}"`;
    },
  }) as unknown as Struct<Infer<Head> | InferStructTuple<Tail>[number], null>;
}
