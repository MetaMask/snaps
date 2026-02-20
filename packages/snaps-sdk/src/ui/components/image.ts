import { assign, object } from '@metamask/superstruct';

import { svg, literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const ImageStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Image),
    value: svg(),
  }),
);
