import { Box, Spacer, Text } from 'ink';
import type { FunctionComponent, ReactNode } from 'react';

export type HeaderProps = {
  children?: ReactNode;
  currentStep: number;
  totalSteps: number;
};

export const Header: FunctionComponent<HeaderProps> = ({
  children,
  currentStep,
  totalSteps,
}) => {
  return (
    <Box marginTop={1} marginX={1} paddingX={1} borderStyle="single">
      <Text>Create Snap</Text>
      <Text dimColor={true}> / {children}</Text>
      <Spacer />
      <Text dimColor={true}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </Box>
  );
};
