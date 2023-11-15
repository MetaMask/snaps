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

export type Address = Infer<typeof AddressStruct>;

export const address = createBuilder(NodeType.Address, AddressStruct, [
  'value',
]);
