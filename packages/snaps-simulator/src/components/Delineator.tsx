import { Box, Flex, Text } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';

import { Icon } from './Icon';

export type DelineatorProps = {
  type: DelineatorType;
  snapName: string;
  children: ReactNode;
};

export enum DelineatorType {
  Content = 'content',
  Error = 'error',
  Insights = 'insights',
}

const getTitle = (type: DelineatorType, snapName: string) => {
  switch (type) {
    case DelineatorType.Insights:
      return `Insights from ${snapName}`;
    case DelineatorType.Error:
      return `Error from ${snapName}`;
    default:
      return `Content from ${snapName}`;
  }
};

export const Delineator: FunctionComponent<DelineatorProps> = ({
  type,
  snapName,
  children,
}) => {
  const isError = type === DelineatorType.Error;
  return (
    <Box
      border="1px solid"
      borderColor="border.default"
      borderRadius="md"
      backgroundColor={isError ? 'error.muted' : undefined}
    >
      <Flex
        direction="row"
        alignItems="center"
        padding="1.5"
        borderBottom="1px solid"
        borderColor="border.default"
      >
        <Icon
          icon={isError ? 'snapError' : 'snap'}
          width="16px"
          marginRight="1"
        />
        <Text
          fontFamily="custom"
          fontSize="xs"
          color={isError ? 'text.error' : undefined}
        >
          {getTitle(type, snapName)}
        </Text>
      </Flex>
      <Box padding="3">{children}</Box>
    </Box>
  );
};
