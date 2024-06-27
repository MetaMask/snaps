import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare const SpinnerStruct: import("@metamask/superstruct").Struct<{
    type: NodeType.Spinner;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Spinner, NodeType.Spinner>;
}>;
/**
 * A spinner node, that renders a spinner, either as a full-screen overlay, or
 * inline when nested inside a {@link Panel}.
 */
export declare type Spinner = Infer<typeof SpinnerStruct>;
/**
 * Create a {@link Spinner} node.
 *
 * @returns The spinner node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = spinner();
 */
export declare const spinner: () => {
    type: NodeType.Spinner;
};
