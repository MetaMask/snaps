import {
  assign,
  boolean,
  object,
  optional,
  string,
} from '@metamask/superstruct';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const TextStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Text),
    value: string(),
    markdown: optional(boolean()),
  }),
);
