import { Box, Flex, List, ListItem, Text } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import type { FunctionComponent } from 'react';

import type { IconName } from '../../../components';
import { TemplateComponent } from './TemplateComponent';

type TemplateComponent = {
  icon: IconName;
  text: string;
  data: Component;
  droppable: boolean;
};

const TEMPLATE_COMPONENTS: TemplateComponent[] = [
  {
    icon: 'panel',
    text: 'Panel',
    data: panel([]),
    droppable: true,
  },
  {
    icon: 'heading',
    text: 'Heading',
    data: heading('Heading'),
    droppable: false,
  },
  {
    icon: 'text',
    text: 'Text',
    data: text('Text'),
    droppable: false,
  },
  {
    icon: 'divider',
    text: 'Divider',
    data: divider(),
    droppable: false,
  },
  {
    icon: 'copyable',
    text: 'Copyable',
    data: copyable('Copyable text'),
    droppable: false,
  },
];

export type ComponentsListProps = {
  nextId: number;
  incrementId: () => void;
};

export const TemplateComponentList: FunctionComponent<ComponentsListProps> = ({
  nextId,
  incrementId,
}) => (
  <Box marginBottom="4">
    <Text fontSize="xs" fontWeight="600" lineHeight="133%" marginBottom="1">
      Components
    </Text>
    <Flex as={List} gap="2">
      {TEMPLATE_COMPONENTS.map((component) => (
        <ListItem key={`component-${component.text}`}>
          <TemplateComponent
            incrementId={incrementId}
            icon={component.icon}
            node={{
              id: nextId,
              parent: 0,
              droppable: component.droppable,
              text: component.text,
              data: component.data,
            }}
          />
        </ListItem>
      ))}
    </Flex>
  </Box>
);
