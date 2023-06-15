import { Box } from '@chakra-ui/react';
import { Component } from '@metamask/snaps-ui';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';

import { IconName, Prefill } from '../../../components';

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
