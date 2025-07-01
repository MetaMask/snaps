import { Box } from 'ink';
import type { FunctionComponent } from 'react';

import { Task } from './components/Task.js';
import { Header } from '../../components/Header.js';

export const Install: FunctionComponent = () => {
  return (
    <Box flexDirection="column" gap={1}>
      <Header />
      <Task />
    </Box>
  );
};
