import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
import type { IconName } from '../../../components';
declare type TemplateComponentProps = {
    node: NodeModel<JSXElement>;
    icon: IconName;
    incrementId: () => void;
};
export declare const TemplateComponent: FunctionComponent<TemplateComponentProps>;
export {};
