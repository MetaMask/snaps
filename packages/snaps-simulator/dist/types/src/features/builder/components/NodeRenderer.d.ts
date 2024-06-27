import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
export declare type NodeRendererProps = {
    items: NodeModel<JSXElement>[];
};
/**
 * A node renderer, which renders the result of a node tree. The tree is
 * converted to a component, which is then rendered in the MetaMask window.
 *
 * @param props - The props of the component.
 * @param props.items - The items to render in the tree.
 * @returns A node renderer component.
 */
export declare const NodeRenderer: FunctionComponent<NodeRendererProps>;
