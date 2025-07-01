import { Spacer, Text } from 'ink';
import type { FunctionComponent } from 'react';

import { Header } from '../../../components/Header.js';

export type FlowHeaderProps = {
  children: string;
  currentStep: number;
  totalSteps: number;
};

export const FlowHeader: FunctionComponent<FlowHeaderProps> = ({
  children,
  currentStep,
  totalSteps,
}) => {
  return (
    <Header>
      <Text dimColor={true}>/ {children}</Text>
      <Spacer />
      <Text dimColor={true}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </Header>
  );
};
