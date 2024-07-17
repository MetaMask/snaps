import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare const ImageStruct: import("@metamask/superstruct").Struct<{
    value: string;
    type: NodeType.Image;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Image, NodeType.Image>;
    value: import("@metamask/superstruct").Struct<string, null>;
}>;
/**
 * An image node, that renders an SVG image.
 *
 * @property type - The type of the node. Must be the string `image`.
 * @property value - The SVG image to be rendered.
 */
export declare type Image = Infer<typeof ImageStruct>;
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
export declare const image: (...args: string[] | [Omit<{
    value: string;
    type: NodeType.Image;
}, "type">]) => {
    value: string;
    type: NodeType.Image;
};
