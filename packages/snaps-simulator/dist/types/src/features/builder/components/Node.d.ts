import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
declare type NodeProps = {
    node: NodeModel<JSXElement>;
    depth: number;
    isDragging: boolean;
    onChange: (node: NodeModel<JSXElement>, key: string, value: string) => void;
    onClose?: ((node: NodeModel<JSXElement>) => void) | undefined;
};
/**
 * A node, which renders a component in the builder. The node can be editable or
 * non-editable.
 *
 * @param props - The props of the component.
 * @param props.node - The node to render.
 * @param props.depth - The depth of the node in the tree.
 * @param props.isDragging - Whether the node is being dragged.
 * @param props.onChange - A function to call when the node changes.
 * @param props.onClose - A function to call when the node is closed.
 * @returns A node component.
 */
export declare const Node: FunctionComponent<NodeProps>;
export {};
