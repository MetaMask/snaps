import { assign, object } from '@metamask/superstruct';

import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const SpinnerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Spinner),
  }),
);
