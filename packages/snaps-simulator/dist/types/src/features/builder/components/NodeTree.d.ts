import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
export declare type NodeTreeProps = {
    items: NodeModel<JSXElement>[];
    setItems: (items: NodeModel<JSXElement>[]) => void;
};
/**
 * A node tree, which renders the UI components in the builder.
 *
 * @param props - The props of the component.
 * @param props.items - The items to render in the tree.
 * @param props.setItems - A function to set the items in the tree.
 * @returns A node tree component.
 */
export declare const NodeTree: FunctionComponent<NodeTreeProps>;
