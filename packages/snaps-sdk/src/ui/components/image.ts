import type { Infer } from '@metamask/superstruct';
import { assign, literal, object } from '@metamask/superstruct';

import { svg } from '../../internals';
import { createBuilder } from '../builder';
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

/**
 * Create an {@link Image} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `value` property.
 * @param args.value - The SVG image to be rendered. Must be a valid SVG string.
 * @returns The image node as object. Other image formats are supported by
 * embedding them as data URLs in the SVG.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = image({ value: '<svg />' });
 * const node = image('<svg />');
 */
export const image = createBuilder(NodeType.Image, ImageStruct, ['value']);
