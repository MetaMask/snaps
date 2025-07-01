import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useCommand } from '../hooks/useCommand.js';

export const Task: FunctionComponent = () => {
  useInput(() => {});
  const { run, output } = useCommand('yarn');

  useEffect(() => {
    (async () => {
      try {
        await run();
      } catch (error) {
        console.error('Error during installation:', error);
      }
    })();
  }, []);

  return (
    <Box flexDirection="column">
      <Box gap={1} marginX={3}>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text>Installing dependencies</Text>
      </Box>
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        height={10}
      >
        {output.slice(-5).map((line, index) => (
          <Text key={index} color={line.type === 'stderr' ? 'red' : 'white'}>
            {line.data}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
