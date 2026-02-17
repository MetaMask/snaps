import type { Infer } from '@metamask/superstruct';
import { assign, object } from '@metamask/superstruct';

import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const SpinnerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Spinner),
  }),
);

/**
 * A spinner node, that renders a spinner, either as a full-screen overlay, or
 * inline when nested inside a {@link Panel}.
 */
export type Spinner = Infer<typeof SpinnerStruct>;
