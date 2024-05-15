import type { Infer } from 'superstruct';
import { NodeType } from '../nodes';
export declare const HeadingStruct: import("superstruct").Struct<{
    value: string;
    type: NodeType.Heading;
}, {
    type: import("superstruct").Struct<NodeType.Heading, NodeType.Heading>;
    value: import("superstruct").Struct<string, null>;
}>;
/**
 * A heading node, that renders the text as a heading. The level of the heading
 * is determined by the depth of the heading in the document.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export declare type Heading = Infer<typeof HeadingStruct>;
/**
 * Create a {@link Heading} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `value` property.
 * @param args.value - The heading text.
 * @returns The heading node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = heading({ value: 'Hello, world!' });
 * const node = heading('Hello, world!');
 */
export declare const heading: (...args: string[] | [Omit<{
    value: string;
    type: NodeType.Heading;
}, "type">]) => {
    value: string;
    type: NodeType.Heading;
};
