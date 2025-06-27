import { Box, Text } from 'ink';
import type { FunctionComponent, ReactNode } from 'react';

export type FieldProps = {
  children: ReactNode;
  name: string;
  description?: string;
  error?: string;
};

export const Field: FunctionComponent<FieldProps> = ({
  children,
  name,
  description,
  error,
}) => {
  return (
    <Box flexDirection="column" marginX={2} marginTop={1}>
      <Box gap={1}>
        <Text color={error ? 'red' : 'green'} bold={true}>
          {name}:
        </Text>
        {children}
      </Box>
      {description && <Text dimColor={true}>{description}</Text>}
      {error && <Text color="red">{error}</Text>}
    </Box>
  );
};
