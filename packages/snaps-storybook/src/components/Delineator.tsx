import { Box, Flex, Text } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';

import { SnapIcon } from './icons';

/**
 * The props for the {@link Delineator} component.
 */
export type DelineatorProps = {
  /**
   * The children to render in the delineator.
   */
  children?: ReactNode;
};

/**
 * The Snaps delineator component, shown in the extension window.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the component.
 * @returns A delineator element.
 */
export const Delineator: FunctionComponent<DelineatorProps> = ({
  children,
}) => (
  <Box
    margin="4"
    border="muted"
    borderRadius="lg"
    background="background.default"
  >
    <Flex padding="1" gap="1" borderBottom="muted" alignItems="center">
      <SnapIcon margin="3px" />
      <Text fontSize="xs" lineHeight="shorter">
        Content from{' '}
        <Box as="span" fontWeight="500">
          Title
        </Box>
      </Text>
    </Flex>
    <Box margin="4">{children}</Box>
  </Box>
);
