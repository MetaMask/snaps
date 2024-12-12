import type {
  AnyStruct,
  Infer,
  InferStructTuple,
  ObjectSchema,
  Struct,
} from '@metamask/superstruct';
import {
  array,
  boolean,
  lazy,
  nullable,
  number,
  object,
  record,
  string,
} from '@metamask/superstruct';
import { JsonStruct } from '@metamask/utils';

import type { Describe } from '../../internals';
import { nullUnion, selectiveUnion, literal } from '../../internals';
import type { EmptyObject } from '../../types';
import type {
  GenericSnapElement,
  Key,
  Nestable,
  StringElement,
} from '../component';

/**
 * A struct for the {@link Key} type.
 */
export const KeyStruct: Describe<Key> = nullUnion([string(), number()]);

/**
 * A struct for the {@link StringElement} type.
 */
export const StringElementStruct: Describe<StringElement> = children([
  string(),
]);

/**
 * A struct for the {@link GenericSnapElement} type.
 */
export const ElementStruct: Describe<GenericSnapElement> = object({
  type: string(),
  props: record(string(), JsonStruct),
  key: nullable(KeyStruct),
});

/**
 * A helper function for creating a struct for a {@link Nestable} type.
 *
 * @param struct - The struct for the type to test.
 * @returns The struct for the nestable type.
 */
function nestable<Type, Schema>(
  struct: Struct<Type, Schema>,
): Struct<Nestable<Type>, any> {
  const nestableStruct: Struct<Nestable<Type>> = selectiveUnion((value) => {
    if (Array.isArray(value)) {
      return array(lazy(() => nestableStruct));
    }
    return struct;
  });

  return nestableStruct;
}

/**
 * A helper function for creating a struct which allows children of a specific
 * type, as well as `null` and `boolean`.
 *
 * @param structs - The structs to allow as children.
 * @returns The struct for the children.
 */
export function children<Head extends AnyStruct, Tail extends AnyStruct[]>(
  structs: [head: Head, ...tail: Tail],
): Struct<
  Nestable<Infer<Head> | InferStructTuple<Tail>[number] | boolean | null>,
  null
> {
  return nestable(
    nullable(
      selectiveUnion((value) => {
        if (typeof value === 'boolean') {
          return boolean();
        }
        if (structs.length === 1) {
          return structs[0];
        }
        return nullUnion(structs);
      }),
    ),
  ) as unknown as Struct<
    Nestable<Infer<Head> | InferStructTuple<Tail>[number] | boolean | null>,
    null
  >;
}

/**
 * A helper function for creating a struct which allows a single child of a specific
 * type, as well as `null` and `boolean`.
 *
 * @param struct - The struct to allow as a single child.
 * @returns The struct for the children.
 */
export function singleChild<Type extends AnyStruct>(
  struct: Type,
): Struct<Infer<Type> | boolean | null, null> {
  return nullable(
    selectiveUnion((value) => {
      if (typeof value === 'boolean') {
        return boolean();
      }

      return struct;
    }),
  ) as unknown as Struct<Infer<Type> | boolean | null, null>;
}

/**
 * A helper function for creating a struct for a JSX element.
 *
 * @param name - The name of the element.
 * @param props - The props of the element.
 * @returns The struct for the element.
 */
export function element<
  Name extends string,
  Props extends ObjectSchema = EmptyObject,
>(name: Name, props: Props = {} as Props) {
  return object({
    type: literal(name) as unknown as Struct<Name, Name>,
    props: object(props),
    key: nullable(KeyStruct),
  });
}

/**
 * A helper function for creating a struct for a JSX element with selective props.
 *
 * @param name - The name of the element.
 * @param selector - The selector function choosing the struct to validate with.
 * @returns The struct for the element.
 */
export function elementWithSelectiveProps<
  Name extends string,
  Selector extends (value: any) => AnyStruct,
>(name: Name, selector: Selector) {
  return object({
    type: literal(name) as unknown as Struct<Name, Name>,
    props: selectiveUnion(selector),
    key: nullable(KeyStruct),
  });
}
