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
