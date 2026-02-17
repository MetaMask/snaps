import type { Infer } from '@metamask/superstruct';
import { assign, object } from '@metamask/superstruct';
import { HexChecksumAddressStruct } from '@metamask/utils';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const AddressStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Address),
    value: HexChecksumAddressStruct,
  }),
);

/**
 * A address node, that renders an EVM-like address and its icon.
 *
 * @property type - The type of the node. Must be the string `address`.
 * @property value - The address in hexadecimal, including 0x.
 */
export type Address = Infer<typeof AddressStruct>;
