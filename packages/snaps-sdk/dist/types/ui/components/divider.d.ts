import type { Infer } from 'superstruct';
import { NodeType } from '../nodes';
export declare const DividerStruct: import("superstruct").Struct<{
    type: NodeType.Divider;
}, {
    type: import("superstruct").Struct<NodeType.Divider, NodeType.Divider>;
}>;
/**
 * A divider node, that renders a line between other nodes.
 */
export declare type Divider = Infer<typeof DividerStruct>;
/**
 * Create a {@link Divider} node.
 *
 * @returns The divider node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = divider();
 */
export declare const divider: () => {
    type: NodeType.Divider;
};
