import { Box } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';

import type { IconName } from '../../../components';
import { Prefill } from '../../../components';

type TemplateComponentProps = {
  node: NodeModel<Component>;
  icon: IconName;
  incrementId: () => void;
};

export const TemplateComponent: FunctionComponent<TemplateComponentProps> = ({
  node,
  icon,
  incrementId,
}) => {
  const [, drag] = useDrag({
    type: 'template',
    item: node,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        incrementId();
      }
    },
  });

  return (
    <Prefill
      icon={icon}
      iconLocation="left"
      cursor="move"
      userSelect="none"
      ref={drag}
    >
      <Box>{node.text}</Box>
    </Prefill>
  );
};
