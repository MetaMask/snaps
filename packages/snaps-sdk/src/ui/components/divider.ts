import type { Infer } from '@metamask/superstruct';
import { assign, object } from '@metamask/superstruct';

import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const DividerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Divider),
  }),
);

/**
 * A divider node, that renders a line between other nodes.
 */
export type Divider = Infer<typeof DividerStruct>;
