import { assign, object, string } from '@metamask/superstruct';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const HeadingStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Heading),
    value: string(),
  }),
);
