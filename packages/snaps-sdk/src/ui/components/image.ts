import type { Infer } from 'superstruct';
import { assign, literal, object, refine, string } from 'superstruct';

import { isSvg } from '../../internals';
import { createBuilder } from '../builder';
import { NodeStruct, NodeType } from '../nodes';

/**
 * Get a Struct that validates a string as a valid SVG.
 *
 * @returns A Struct that validates a string as a valid SVG.
 * @internal
 */
export function svg() {
  return refine(string(), 'SVG', (value) => {
    if (!isSvg(value)) {
      return 'Value is not a valid SVG.';
    }

    return true;
  });
}

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
 * @example
 * const node = image({ value: '<svg />' });
 * const node = image('<svg />');
 */
export const image = createBuilder(NodeType.Image, ImageStruct, ['value']);
