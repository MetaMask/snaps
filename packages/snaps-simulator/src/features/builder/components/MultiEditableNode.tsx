import { Box } from '@chakra-ui/react';
import type { Button, Form, Input } from '@metamask/snaps-sdk';
import {
  ButtonType,
  ButtonVariant,
  InputType,
  NodeType,
} from '@metamask/snaps-sdk';
import type { FunctionComponent } from 'react';

import type { EditableNodeProps } from '../../../types';
import { BaseNode } from './BaseNode';
import { EditableNodeInput } from './EditableNodeInput';
import { EditableNodeSelect } from './EditableNodeSelect';

export type MultiEditableComponent = Button | Input | Form;

type MultiEditableNodes = Record<
  MultiEditableComponent['type'],
  Record<string, { type: 'string' } | { type: 'dropdown'; values: string[] }>
>;

export const MULTI_EDITABLE_NODES: MultiEditableNodes = {
  [NodeType.Input]: {
    name: {
      type: 'string',
    },
    label: {
      type: 'string',
    },
    placeholder: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    inputType: {
      type: 'dropdown',
      values: [InputType.Text, InputType.Number, InputType.Password],
    },
    error: {
      type: 'string',
    },
  },
  [NodeType.Button]: {
    name: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    variant: {
      type: 'dropdown',
      values: [ButtonVariant.Primary, ButtonVariant.Secondary],
    },
    buttonType: {
      type: 'dropdown',
      values: [ButtonType.Button, ButtonType.Submit],
    },
  },
  [NodeType.Form]: {
    name: {
      type: 'string',
    },
  },
};

/**
 * An editable node with multiple fields, which renders an editable component in the builder.
 *
 * @param props - The props of the component.
 * @param props.node - The editable node to render.
 * @param props.depth - The depth of the node in the tree.
 * @param props.isDragging - Whether the node is being dragged.
 * @param props.onChange - A function to call when the node changes.
 * @param props.onClose - A function to call when the node is closed.
 * @returns An editable node component.
 */
export const MultiEditableNode: FunctionComponent<
  EditableNodeProps<MultiEditableComponent>
> = ({ node, depth, isDragging, onChange, onClose }) => {
  if (!node.data) {
    return null;
  }

  const nodeDataOptions = MULTI_EDITABLE_NODES[node.data.type];
  return (
    <Box marginLeft={`${depth * 16}px`}>
      <BaseNode node={node} isDragging={isDragging} onClose={onClose}>
        <Box display="flex" flexDirection="column" gap="6px" width="100%">
          {Object.keys(nodeDataOptions).map((key) => {
            const property = nodeDataOptions[key];

            const handleChange = (value: string) => {
              onChange?.(node, key, value);
            };

            if (property.type === 'string') {
              return (
                <EditableNodeInput
                  placeholder={key}
                  key={`${key}-input`}
                  defaultValue={node.data?.[key as keyof typeof node.data]}
                  onChange={handleChange}
                />
              );
            }

            if (property.type === 'dropdown') {
              return (
                <EditableNodeSelect
                  key={`${key}-select`}
                  defaultValue={node.data?.[key as keyof typeof node.data]}
                  onChange={handleChange}
                  options={property.values}
                />
              );
            }

            return null;
          })}
        </Box>
      </BaseNode>
    </Box>
  );
};
