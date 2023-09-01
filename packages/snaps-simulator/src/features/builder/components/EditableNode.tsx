import { Box, Input } from '@chakra-ui/react';
import type { Component, Heading, Text } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { ChangeEvent, FunctionComponent } from 'react';
import { useState } from 'react';

import { getNodeText } from '../utils';
import { BaseNode } from './BaseNode';

export type EditableComponent = Text | Heading;

type EditableNodeProps = {
  node: NodeModel<EditableComponent>;
  depth: number;
  isDragging: boolean;
  onChange?: (node: NodeModel<EditableComponent>, value: string) => void;
  onClose?: ((node: NodeModel<Component>) => void) | undefined;
};

/**
 * An editable node, which renders an editable component in the builder.
 *
 * @param props - The props of the component.
 * @param props.node - The editable node to render.
 * @param props.depth - The depth of the node in the tree.
 * @param props.isDragging - Whether the node is being dragged.
 * @param props.onChange - A function to call when the node changes.
 * @param props.onClose - A function to call when the node is closed.
 * @returns An editable node component.
 */
export const EditableNode: FunctionComponent<EditableNodeProps> = ({
  node,
  depth,
  isDragging,
  onChange,
  onClose,
}) => {
  const text = getNodeText(node);
  assert(text !== null, 'Node must have text.');

  const [value, setValue] = useState(text);

  const handleChange = (newValue: ChangeEvent<HTMLInputElement>) => {
    setValue(newValue.target.value);
    onChange?.(node, newValue.target.value);
  };

  return (
    <Box marginLeft={`${depth * 16}px`}>
      <BaseNode node={node} isDragging={isDragging} onClose={onClose}>
        <Input
          value={value}
          onChange={handleChange}
          fontSize="sm"
          bg="chakra-body-bg"
          borderColor="border.default"
          outline="none"
          _active={{
            borderColor: 'border.active',
            outline: 'none',
            boxShadow: 'none',
          }}
          _focusVisible={{
            borderColor: 'border.active',
            outline: 'none',
            boxShadow: 'none',
          }}
        />
      </BaseNode>
    </Box>
  );
};
