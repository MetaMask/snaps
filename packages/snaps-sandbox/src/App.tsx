import { Flex, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Sandbox, Sidebar } from './components';

export const App: FunctionComponent = () => (
  <HStack>
    <Sidebar />
    <Flex
      align="center"
      justify="center"
      width="9/12"
      maxWidth="100%"
      minHeight="100vh"
    >
      <Sandbox />
    </Flex>
  </HStack>
);
