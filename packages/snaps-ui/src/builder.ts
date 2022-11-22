import { assertStruct } from '@metamask/utils';
import { Struct } from 'superstruct';

import {
  Component,
  DividerStruct,
  HeadingStruct,
  NodeType,
  PanelStruct,
  SpacerStruct,
  SpinnerStruct,
  TextStruct,
} from './nodes';

/**
 * A function that builds a {@link Component}. This infers the proper args type
 * from the given node.
 */
type NodeBuilder<Node> = Omit<Node, 'type'> extends Record<string, never>
  ? (args?: undefined) => Node
  : (args: Omit<Node, 'type'>) => Node;

/**
 * A function that returns a function to "build" a {@link Component}. It infers
 * the type of the component from the given struct, and performs validation on
 * the created component.
 *
 * @param type - The type of the component to build.
 * @param struct - The struct to use to validate the component.
 * @returns A function that builds a component of the given type.
 */
function createBuilder<Node extends Component>(
  type: NodeType,
  struct: Struct<Node>,
): NodeBuilder<Node> {
  return (args: Omit<Node, 'type'> | undefined) => {
    const node = { type, ...args };

    // The user could be passing invalid values to the builder, so we need to
    // validate them as per the component's struct.
    assertStruct(node, struct, `Invalid ${type} component`);
    return node;
  };
}

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
 * @param args - The node arguments.
 * @param args.text - The heading text.
 * @returns The heading node as object.
 * @example
 * ```typescript
 * const node = heading({ text: 'Hello world!' });
 * ```
 */
export const heading = createBuilder(NodeType.Heading, HeadingStruct);

/**
 * Create a {@link Panel} node.
 *
 * @param args - The node arguments.
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
 * ```
 */
export const panel = createBuilder(NodeType.Panel, PanelStruct);

/**
 * Create a {@link Spacer} node.
 *
 * @returns The spacer node as object.
 * @example
 * ```typescript
 * const node = spacer();
 * ```
 */
export const spacer = createBuilder(NodeType.Spacer, SpacerStruct);

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
 * @param args - The node arguments.
 * @param args.text - The text content of the node.
 * @returns The text node as object.
 * @example
 * ```typescript
 * const node = text({ text: 'Hello, world!' });
 * ```
 */
export const text = createBuilder(NodeType.Text, TextStruct);
