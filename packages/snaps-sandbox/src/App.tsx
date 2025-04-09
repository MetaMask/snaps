import { Flex, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Sandbox } from './components';
import { Sidebar } from './features/sidebar';

export const App: FunctionComponent = () => (
  <HStack gap="0">
    <Sidebar />
    <Flex
      justify="center"
      flexGrow="1"
      maxWidth="100%"
      minHeight="100vh"
      paddingY="24"
    >
      <Sandbox />
    </Flex>
  </HStack>
);
