import { Box, Flex, Text } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';

import { Icon } from './Icon';

export type DelineatorProps = {
  snapName: string;
  children: ReactNode;
};

export const Delineator: FunctionComponent<DelineatorProps> = ({
  snapName,
  children,
}) => (
  <Box border="1px solid" borderColor="border.default" borderRadius="md">
    <Flex
      direction="row"
      alignItems="center"
      padding="1.5"
      borderBottom="1px solid"
      borderColor="border.default"
    >
      <Icon icon="snap" width="16px" marginRight="1" />
      <Text fontFamily="custom" fontSize="xs">
        Content from {snapName}
      </Text>
    </Flex>
    <Box padding="3">{children}</Box>
  </Box>
);
