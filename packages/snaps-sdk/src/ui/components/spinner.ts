import type { Infer } from 'superstruct';
import { assign, literal, object } from 'superstruct';

import { createBuilder } from '../builder';
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

/**
 * Create a {@link Spinner} node.
 *
 * @returns The spinner node as object.
 * @example
 * const node = spinner();
 */
export const spinner = createBuilder(NodeType.Spinner, SpinnerStruct);
