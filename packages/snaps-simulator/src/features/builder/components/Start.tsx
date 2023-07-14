import { Flex, Heading, Text } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Icon } from '../../../components';

export const Start: FunctionComponent = () => (
  <Flex
    flexDirection="column"
    alignItems="center"
    borderColor="border.default"
    padding="4"
    paddingTop="12"
    borderRadius="lg"
    background="background.alternative"
    flex="1"
    marginY="-4"
  >
    <Icon icon="drag" marginBottom="1.5" />
    <Heading
      as="h3"
      fontSize="sm"
      fontWeight="700"
      color="text.muted"
      marginBottom="1"
    >
      Drag components in here
    </Heading>
    <Text fontSize="xs" fontWeight="500" color="text.muted" textAlign="center">
      Build your UI piece-by-piece using the
      <br />
      predefined components above.
    </Text>
  </Flex>
);
