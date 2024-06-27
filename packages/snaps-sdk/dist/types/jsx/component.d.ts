import type { Json } from '@metamask/utils';
/**
 * A key, which can be a string or a number.
 */
export declare type Key = string | number;
/**
 * A JSON object.
 */
export declare type JsonObject = Record<string, Json>;
/**
 * A generic JSX element.
 *
 * @property type - The type of the element.
 * @property props - The props of the element.
 * @property key - The key of the element.
 */
export declare type GenericSnapElement = {
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
export declare type SnapElement<Props extends JsonObject = Record<string, never>, Type extends string = string> = {
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
export declare type Nestable<Type> = Type | Nestable<Type>[];
/**
 * A type that can be a single value or an array of values, a boolean, or null.
 *
 * @template Type - The type that can be an array.
 */
export declare type SnapsChildren<Type> = Nestable<Type | boolean | null>;
/**
 * A JSX node, which can be an element, a string, null, or an array of nodes.
 */
export declare type SnapNode = SnapsChildren<GenericSnapElement | string>;
/**
 * A JSX string element, which can be a string or an array of strings, or
 * booleans (for conditional rendering).
 */
export declare type StringElement = SnapsChildren<string>;
/**
 * A JSX component.
 */
export declare type SnapComponent<Props extends JsonObject = Record<string, never>, Type extends string = string> = (props: Props & {
    key?: Key | null;
}) => SnapElement<Props, Type>;
/**
 * Create a Snap component from a type. This is a helper function that creates a
 * Snap component function.
 *
 * @param type - The type of the component.
 * @returns A function that creates a Snap element.
 * @see SnapComponent
 */
export declare function createSnapComponent<Props extends JsonObject = Record<string, never>, Type extends string = string>(type: Type): SnapComponent<Props, Type>;
