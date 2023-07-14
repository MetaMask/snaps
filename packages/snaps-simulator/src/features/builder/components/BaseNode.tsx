import { Flex, Text } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import type { FunctionComponent, ReactNode } from 'react';

import type { IconName } from '../../../components';
import { Icon } from '../../../components';

export type BaseNodeProps = {
  node: NodeModel<Component>;
  isDragging: boolean;
  children?: ReactNode;
  onClose?: ((node: NodeModel<Component>) => void) | undefined;
};

export const BaseNode: FunctionComponent<BaseNodeProps> = ({
  node,
  isDragging,
  children,
  onClose,
}) => {
  assert(node.data?.type, 'Node must have a type.');

  const handleClick = () => {
    onClose?.(node);
  };

  return (
    <Flex
      paddingY="2"
      paddingLeft="4"
      paddingRight="2"
      background="background.alternative"
      borderRadius="lg"
      gap="4"
      alignItems="center"
      border="1px solid"
      borderColor="border.default"
      display={isDragging ? 'none' : 'flex'}
      marginX="4"
      cursor={node.id > 1 ? 'move' : 'default'}
    >
      <Icon icon={node.data.type as IconName} width="16px" />
      <Text
        fontWeight="500"
        fontSize="sm"
        textTransform="capitalize"
        color="text.muted"
        display="inline-block"
        minWidth="65px"
      >
        {node.data.type}
      </Text>
      {children}
      {node.id >= 2 && (
        <Icon
          icon="cross"
          width="11px"
          marginX="0.5"
          marginLeft="auto"
          cursor="pointer"
          onClick={handleClick}
        />
      )}
    </Flex>
  );
};
