import type { AnyStruct, Infer, InferStructTuple } from '@metamask/superstruct';
import {
  Struct,
  define,
  record,
  refine,
  literal as superstructLiteral,
  union as superstructUnion,
} from '@metamask/superstruct';
import type { PlainObject } from '@metamask/utils';
import { hasProperty, isObject } from '@metamask/utils';

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
  const flatStructs = structs
    .map((struct) =>
      struct.type === 'union' && Array.isArray(struct.schema)
        ? struct.schema
        : struct,
    )
    .flat(Infinity);
  const types = flatStructs.map(({ schema }) => schema.type.type);
  const structMap = flatStructs.reduce<Record<string, Struct>>(
    (accumulator, struct) => {
      accumulator[JSON.parse(struct.schema.type.type)] = struct;
      return accumulator;
    },
    {},
  );
  return new Struct({
    type: 'union',
    schema: flatStructs,
    *entries(value, context) {
      if (
        !isObject(value) ||
        !hasProperty(value, 'type') ||
        typeof value.type !== 'string'
      ) {
        return;
      }

      const { type } = value;
      const struct = structMap[type];

      if (!struct) {
        return;
      }

      for (const entry of struct.entries(value, context)) {
        yield entry;
      }
    },
    coercer(value, context) {
      if (
        !isObject(value) ||
        !hasProperty(value, 'type') ||
        typeof value.type !== 'string'
      ) {
        return value;
      }

      const { type } = value;
      const struct = structMap[type];
      if (struct) {
        return struct.coercer(value, context);
      }

      return value;
    },
    // At this point we know the value to be an object.
    *refiner(value: PlainObject & { type: string }, context) {
      const struct = structMap[value.type];

      yield* struct.refiner(value, context);
    },
    validator(value, context) {
      if (
        !isObject(value) ||
        !hasProperty(value, 'type') ||
        typeof value.type !== 'string'
      ) {
        return `Expected type to be one of: ${types.join(
          ', ',
        )}, but received: undefined`;
      }

      const { type } = value;

      const struct = structMap[type];

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

/**
 * Create a custom union struct that uses a `selector` function for choosing
 * the validation path.
 *
 * @param selector - The selector function choosing the struct to validate with.
 * @returns The `superstruct` struct, which validates that the value satisfies
 * one of the structs.
 */
export function selectiveUnion<Selector extends (value: any) => AnyStruct>(
  selector: Selector,
): Struct<Infer<ReturnType<Selector>>, null> {
  return new Struct({
    type: 'union',
    schema: null,
    *entries(value, context) {
      const struct = selector(value);

      for (const entry of struct.entries(value, context)) {
        yield entry;
      }
    },
    *refiner(value, context) {
      const struct = selector(value);

      yield* struct.refiner(value, context);
    },
    coercer(value, context) {
      const struct = selector(value);

      return struct.coercer(value, context);
    },
    validator(value, context) {
      const struct = selector(value);

      // This only validates the root of the struct, entries does the rest of the work.
      return struct.validator(value, context);
    },
  });
}

/**
 * Refine a struct to be a non-empty record and disallows usage of arrays.
 *
 * @param Key - The struct for the record key.
 * @param Value - The struct for the record value.
 * @returns The refined struct.
 */
export function nonEmptyRecord<Key extends string, Value>(
  Key: Struct<Key>,
  Value: Struct<Value>,
) {
  return refine(record(Key, Value), 'Non-empty record', (value) => {
    return !Array.isArray(value) && Object.keys(value).length > 0;
  });
}
