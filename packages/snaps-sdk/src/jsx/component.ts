import type { Json } from '@metamask/utils';

/**
 * A key, which can be a string or a number.
 */
export type Key = string | number;

/**
 * A JSON object.
 */
export type JsonObject = Record<string, Json>;

/**
 * A generic JSX element.
 *
 * @property type - The type of the element.
 * @property props - The props of the element.
 * @property key - The key of the element.
 */
export type GenericSnapElement = {
  type: string;
  props: JsonObject;
  key: Key | null;
};

/**
 * A JSX element.
 *
 * @property type - The type of the element.
 * @property props - The props of the element.
 * @property key - The key of the element.
 */
export type SnapElement<
  Props extends JsonObject = Record<string, never>,
  Type extends string = string,
> = {
  type: Type;
  props: Props;
  key: Key | null;
};

/**
 * A type that can be a single value or an infinitely nestable array of values.
 *
 * @template Type - The type that can be an array.
 * @example
 * type NestableString = Nestable<string>;
 * const nestableString: NestableString = 'hello';
 * const nestableStringArray: NestableString = ['hello', 'world', ['foo', ['bar']]];
 */
export type Nestable<Type> = Type | Nestable<Type>[];

/**
 * A type that can be a single value or an array of values, a boolean, or null.
 *
 * @template Type - The type that can be an array.
 */
export type SnapsChildren<Type> = Nestable<Type | boolean | null>;

/**
 * A JSX node, which can be an element, a string, null, or an array of nodes.
 */
export type SnapNode = SnapsChildren<GenericSnapElement | string>;

/**
 * A JSX string element, which can be a string or an array of strings, or
 * booleans (for conditional rendering).
 */
export type StringElement = SnapsChildren<string>;

/**
 * A JSX component.
 */
export type SnapComponent<
  Props extends JsonObject = Record<string, never>,
  Type extends string = string,
> = (props: Props & { key?: Key | null }) => SnapElement<Props, Type>;

/**
 * Remove undefined props from an object.
 *
 * @param props - The object to remove undefined props from.
 * @returns The object without undefined props.
 */
function removeUndefinedProps<Props extends JsonObject>(props: Props): Props {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as Props;
}

/**
 * Create a Snap component from a type. This is a helper function that creates a
 * Snap component function.
 *
 * @param type - The type of the component.
 * @returns A function that creates a Snap element.
 * @see SnapComponent
 */
export function createSnapComponent<
  Props extends JsonObject = Record<string, never>,
  Type extends string = string,
>(type: Type): SnapComponent<Props, Type> {
  return (props: Props & { key?: Key | null }) => {
    const { key = null, ...rest } = props;
    return {
      type,
      props: removeUndefinedProps(rest as Props),
      key,
    };
  };
}
