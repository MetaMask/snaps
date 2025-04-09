import { HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Sandbox } from './components';
import { Sidebar } from './features/sidebar';

export const App: FunctionComponent = () => (
  <HStack gap="0">
    <Sidebar />
    <Sandbox />
  </HStack>
);
