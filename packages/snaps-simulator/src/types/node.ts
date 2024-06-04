import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import type { NodeModel } from '@minoru/react-dnd-treeview';

export type EditableNodeProps<Element extends JSXElement> = {
  node: NodeModel<Element>;
  depth: number;
  isDragging: boolean;
  onChange?: (node: NodeModel<Element>, key: string, value: string) => void;
  onClose?: ((node: NodeModel<Element>) => void) | undefined;
};
