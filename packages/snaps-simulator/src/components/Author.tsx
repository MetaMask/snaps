import { Flex, Text } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { SnapIcon } from './SnapIcon';

type AuthorProps = {
  snapName: string;
  snapId: string;
};

export const Author: FunctionComponent<AuthorProps> = ({
  snapName,
  snapId,
}) => (
  <Flex
    gap="2"
    marginX="4"
    marginY="4"
    border="1px solid"
    borderColor="border.default"
    borderRadius="32px"
    padding="1"
    alignItems="center"
  >
    <SnapIcon snapName={snapName} />
    <Flex direction="column" justify="center">
      <Text fontSize="sm" lineHeight="157%" fontFamily="custom">
        {snapName}
      </Text>
      <Text
        fontSize="xs"
        lineHeight="167%"
        fontFamily="custom"
        color="text.alternative"
      >
        {snapId}
      </Text>
    </Flex>
  </Flex>
);
