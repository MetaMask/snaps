import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent, ReactNode } from 'react';
export declare type BaseNodeProps = {
    node: NodeModel<JSXElement>;
    isDragging: boolean;
    children?: ReactNode;
    onClose?: ((node: NodeModel<JSXElement>) => void) | undefined;
};
export declare const BaseNode: FunctionComponent<BaseNodeProps>;
