import {
  assign,
  boolean,
  object,
  optional,
  string,
} from '@metamask/superstruct';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const CopyableStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Copyable),
    value: string(),
    sensitive: optional(boolean()),
  }),
);
