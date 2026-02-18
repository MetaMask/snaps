import { assign, object } from '@metamask/superstruct';

import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const DividerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Divider),
  }),
);
