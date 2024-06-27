import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';

export type EditableNodeProps<Element extends JSXElement> = {
  node: NodeModel<Element>;
  depth: number;
  isDragging: boolean;
  onChange?: (node: NodeModel<JSXElement>, key: string, value: string) => void;
  onClose?: ((node: NodeModel<JSXElement>) => void) | undefined;
};
