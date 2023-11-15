import type { Infer } from 'superstruct';
import { assign, literal, object, string } from 'superstruct';

import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';

export const AddressStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Address),
    value: string(),
  }),
);

export type Address = Infer<typeof AddressStruct>;

export const address = createBuilder(NodeType.Address, AddressStruct, [
  'value',
]);
