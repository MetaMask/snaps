import type { Component } from '@metamask/snaps-sdk';
import type { NodeModel } from '@minoru/react-dnd-treeview';

export type EditableNodeProps<Components extends Component> = {
  node: NodeModel<Components>;
  depth: number;
  isDragging: boolean;
  onChange?: (node: NodeModel<Components>, key: string, value: string) => void;
  onClose?: ((node: NodeModel<Component>) => void) | undefined;
};
