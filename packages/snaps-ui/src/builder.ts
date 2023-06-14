import { assertStruct, isPlainObject } from '@metamask/utils';
import { Struct } from 'superstruct';

import {
  Component,
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  NodeType,
  PanelStruct,
  SpinnerStruct,
  TextStruct,
  ButtonStruct,
  InputStruct,
  LabelStruct,
  FormStruct,
} from './nodes';

/**
 * A function that builds a {@link Component}. This infers the proper args type
 * from the given node.
 */
type NodeBuilder<Node extends Component, Keys extends (keyof Node)[]> = Omit<
  Node,
  'type'
> extends Record<string, never>
  ? (...args: []) => Node
  : (...args: [Omit<Node, 'type'>] | NodeArrayType<Node, Keys>) => Node;

/**
 * Map from an array of node keys to the corresponding array type.
 *
 * @example
 * ```typescript
 * type Node = { type: 'node'; a: string; b: number; c: boolean };
 * type Keys = ['a', 'b', 'c'];
 *
 * type NodeArray = NodeArrayType<Node, Keys>; // [string, number, boolean]
 * ```
 */
type NodeArrayType<Node extends Component, Keys extends (keyof Node)[]> = {
  [Key in keyof Keys]: Node[Keys[Key]];
};

/**
 * A function that returns a function to "build" a {@link Component}. It infers
 * the type of the component from the given struct, and performs validation on
 * the created component.
 *
 * The returned function can handle the node arguments in two ways:
 * 1. As a single object, with the keys corresponding to the node's properties,
 * excluding the `type` property.
 * 2. As an array of arguments, with the order corresponding to the given keys.
 *
 * @param type - The type of the component to build.
 * @param struct - The struct to use to validate the component.
 * @param keys - The keys of the component to use as arguments to the builder.
 * The order of the keys determines the order of the arguments.
 * @returns A function that builds a component of the given type.
 */
function createBuilder<
  Node extends Component,
  Keys extends (keyof Node)[] = [],
>(
  type: NodeType,
  struct: Struct<Node>,
  keys: Keys = [] as unknown as Keys,
): NodeBuilder<Node, Keys> {
  return (...args: [Omit<Node, 'type'>] | NodeArrayType<Node, Keys> | []) => {
    // Node passed as a single object.
    if (args.length === 1 && isPlainObject(args[0])) {
      const node = { ...args[0], type };

      // The user could be passing invalid values to the builder, so we need to
      // validate them as per the component's struct.
      assertStruct(node, struct, `Invalid ${type} component`);
      return node;
    }

    // Node passed as an array of arguments.
    const node = keys.reduce<Partial<Component>>(
      (partialNode, key, index) => {
        return {
          ...partialNode,
          [key]: args[index],
        };
      },
      { type },
    );

    // The user could be passing invalid values to the builder, so we need to
    // validate them as per the component's struct.
    assertStruct(node, struct, `Invalid ${type} component`);
    return node;
  };
}

/**
 * Create a {@link Copyable} component.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `text` property.
 * @param args.text - The text to copy.
 * @returns A {@link Copyable} component.
 */
export const copyable = createBuilder(NodeType.Copyable, CopyableStruct, [
  'value',
]);

/**
 * Create a {@link Divider} node.
 *
 * @returns The divider node as object.
 * @example
 * ```typescript
 * const node = divider();
 * ```
 */
export const divider = createBuilder(NodeType.Divider, DividerStruct);

/**
 * Create a {@link Heading} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `text` property.
 * @param args.text - The heading text.
 * @returns The heading node as object.
 * @example
 * ```typescript
 * const node = heading({ text: 'Hello, world!' });
 * const node = heading('Hello, world!');
 * ```
 */
export const heading = createBuilder(NodeType.Heading, HeadingStruct, [
  'value',
]);

/**
 * Create a {@link Panel} node.
 *
 * @param args - The node arguments. This can be either an array of children, or
 * an object with a `children` property.
 * @param args.children - The child nodes of the panel. This can be any valid
 * {@link Component}.
 * @returns The panel node as object.
 * @example
 * ```typescript
 * const node = panel({
 *  children: [
 *    heading({ text: 'Hello, world!' }),
 *    text({ text: 'This is a panel.' }),
 *  ],
 * });
 *
 * const node = panel([
 *   heading('Hello, world!'),
 *   text('This is a panel.'),
 * ]);
 * ```
 */
export const panel = createBuilder(NodeType.Panel, PanelStruct, ['children']);

/**
 * Create a {@link Spinner} node.
 *
 * @returns The spinner node as object.
 * @example
 * ```typescript
 * const node = spinner();
 * ```
 */
export const spinner = createBuilder(NodeType.Spinner, SpinnerStruct);

/**
 * Create a {@link Text} node.
 *
 * @param args - The node arguments. This can be either a string, or an object
 * with a `text` property.
 * @param args.text - The text content of the node.
 * @returns The text node as object.
 * @example
 * ```typescript
 * const node = text({ text: 'Hello, world!' });
 * const node = text('Hello, world!');
 * ```
 */
export const text = createBuilder(NodeType.Text, TextStruct, ['value']);

/**
 * Create a {@link Button} node.
 *
 * @param args - The node arguments. This can be either a string, or an object
 * with a `text` property.
 * @param args.variant - The optional variant of the button.
 * @param args.value - The text content of the node.
 * @param args.name - The optional name of the button.
 * @returns The text node as object.
 * @example
 * ```typescript
 * const node = button({  variant: 'primary', text: 'Hello, world!', name: 'myButton' });
 * const node = button('primary', 'Hello, world!', 'myButton');
 * ```
 */
export const button = createBuilder(NodeType.Button, ButtonStruct, [
  'value',
  'variant',
  'name',
  'form',
  'buttonType',
]);

export const input = createBuilder(NodeType.Input, InputStruct, [
  'value',
  'name',
  'inputType',
  'placeholder',
]);

export const label = createBuilder(NodeType.Label, LabelStruct, [
  'value',
  'for',
]);

export const form = createBuilder(NodeType.Form, FormStruct, [
  'children',
  'name',
]);
