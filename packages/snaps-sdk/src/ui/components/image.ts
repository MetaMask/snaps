import type { Infer } from '@metamask/superstruct';
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

/**
 * An image node, that renders an SVG image.
 *
 * @property type - The type of the node. Must be the string `image`.
 * @property value - The SVG image to be rendered.
 */
export type Image = Infer<typeof ImageStruct>;
