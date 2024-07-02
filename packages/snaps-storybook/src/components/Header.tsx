import { Box, Flex, Heading, SkeletonCircle } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

/**
 * The header component for the extension window.
 *
 * @returns The header element.
 */
export const Header: FunctionComponent = () => (
  <Flex as="header" padding="4" gap="4" background="background.default">
    <SkeletonCircle width="40px" height="40px" />
    <Box alignSelf="center">
      <Heading as="h1" fontSize="sm" fontWeight="500" lineHeight="short">
        Title
      </Heading>
      <Heading
        as="h2"
        fontSize="xs"
        fontWeight="400"
        lineHeight="shorter"
        color="text.alternative"
      >
        @organization/lorem-ipsum
      </Heading>
    </Box>
  </Flex>
);
