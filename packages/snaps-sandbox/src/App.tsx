import { Flex, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Sandbox } from './components';
import { Sidebar } from './features/sidebar';

export const App: FunctionComponent = () => (
  <HStack>
    <Sidebar />
    <Flex
      justify="center"
      width="9/12"
      maxWidth="100%"
      minHeight="100vh"
      paddingY="24"
    >
      <Sandbox />
    </Flex>
  </HStack>
);
