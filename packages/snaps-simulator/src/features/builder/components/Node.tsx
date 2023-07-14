import { Box } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import { NodeType } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';

import { BaseNode } from './BaseNode';
import type { EditableComponent } from './EditableNode';
import { EditableNode } from './EditableNode';

export const EDITABLE_NODES = [
  NodeType.Heading,
  NodeType.Text,
  NodeType.Copyable,
];

type NodeProps = {
  node: NodeModel<Component>;
  depth: number;
  isDragging: boolean;
  onChange: (node: NodeModel<Component>, value: string) => void;
  onClose?: ((node: NodeModel<Component>) => void) | undefined;
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
export const Node: FunctionComponent<NodeProps> = ({
  node,
  depth,
  isDragging,
  onChange,
  onClose,
}) => {
  assert(node.data?.type, 'Node must have a type.');
  if (EDITABLE_NODES.includes(node.data.type)) {
    return (
      <EditableNode
        node={node as NodeModel<EditableComponent>}
        depth={depth}
        isDragging={isDragging}
        onChange={onChange}
        onClose={onClose}
      />
    );
  }

  return (
    <Box marginLeft={`${depth * 16}px`}>
      <BaseNode node={node} isDragging={isDragging} onClose={onClose} />
    </Box>
  );
};
