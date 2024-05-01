import type { Infer } from 'superstruct';
import { assign, object, string, unknown } from 'superstruct';

/**
 * The supported node types. This is based on SIP-7.
 *
 * @see https://metamask.github.io/SIPs/SIPS/sip-7
 */
export enum NodeType {
  Copyable = 'copyable',
  Divider = 'divider',
  Heading = 'heading',
  Panel = 'panel',
  Spinner = 'spinner',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Text = 'text',
  Image = 'image',
  Row = 'row',
  Address = 'address',
  Button = 'button',
  Input = 'input',
  Form = 'form',
}

/**
 * @internal
 */
export const NodeStruct = object({
  type: string(),
});

/**
 * The base node type. All nodes extend this type.
 *
 * @property type - The type of the node. See {@link NodeType} for the supported
 * node types.
 * @internal
 */
export type Node = Infer<typeof NodeStruct>;

/**
 * @internal
 */
export const LiteralStruct = assign(
  NodeStruct,
  object({
    value: unknown(),
  }),
);

/**
 * A node with a value. This is used for nodes that render a value, such as
 * {@link Text}.
 *
 * @property type - The type of the node.
 * @property value - The value of the node. The type of the value depends on the
 * node type.
 * @internal
 */
export type Literal = Infer<typeof LiteralStruct>;
