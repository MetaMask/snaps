import type { Infer } from 'superstruct';
import { assign, literal, object, pattern, string } from 'superstruct';

import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';

export const AddressStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Address),
    value: pattern(string(), /0x[a-fA-F0-9]{40}/u),
  }),
);

/**
 * A address node, that renders an EVM-like address and its icon.
 *
 * @property type - The type of the node. Must be the string `address`.
 * @property value - The address in hexadecimal, including 0x.
 */
export type Address = Infer<typeof AddressStruct>;

/**
 * Create an {@link Address} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `value` property.
 * @param args.value - The address to be rendered.
 * @returns The address node as an object.
 * @example
 * const node = address({ value: '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520' });
 * const node = address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520');
 */
export const address = createBuilder(NodeType.Address, AddressStruct, [
  'value',
]);
