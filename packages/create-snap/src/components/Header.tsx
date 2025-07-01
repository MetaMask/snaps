import { Box, Text } from 'ink';
import type { FunctionComponent, ReactNode } from 'react';

export type HeaderProps = {
  children?: ReactNode;
};

export const Header: FunctionComponent<HeaderProps> = ({ children }) => {
  return (
    <Box marginTop={1} marginX={1} paddingX={1} gap={1} borderStyle="single">
      <Text>Create Snap</Text>
      {children}
    </Box>
  );
};
