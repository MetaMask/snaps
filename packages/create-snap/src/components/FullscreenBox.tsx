import { Box } from 'ink';
import type { FunctionComponent, ReactNode } from 'react';

import { useTerminalSize } from '../hooks';

export type FullscreenBoxProps = {
  children: ReactNode;
};

export const FullscreenBox: FunctionComponent<FullscreenBoxProps> = ({
  children,
}) => {
  const { width, height } = useTerminalSize();

  return (
    <Box width={width} minHeight={height} flexDirection="column">
      {children}
    </Box>
  );
};
