import { Box } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';

import { BaseNode } from './BaseNode';
import type { MultiEditableComponent } from './MultiEditableNode';
import { MULTI_EDITABLE_NODES, MultiEditableNode } from './MultiEditableNode';
import type { TextEditableComponent } from './TextEditableNode';
import { TEXT_EDITABLE_NODES, TextEditableNode } from './TextEditableNode';

type NodeProps = {
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
export const Node: FunctionComponent<NodeProps> = ({
  node,
  depth,
  isDragging,
  onChange,
  onClose,
}) => {
  assert(node.data?.type, 'Node must have a type.');
  if (TEXT_EDITABLE_NODES.includes(node.data.type)) {
    return (
      <TextEditableNode
        node={node as NodeModel<TextEditableComponent>}
        depth={depth}
        isDragging={isDragging}
        onChange={onChange}
        onClose={onClose}
      />
    );
  }

  if (Object.keys(MULTI_EDITABLE_NODES).includes(node.data.type)) {
    return (
      <MultiEditableNode
        node={node as NodeModel<MultiEditableComponent>}
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
