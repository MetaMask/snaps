import { Box } from 'ink';
import type { FunctionComponent } from 'react';
import { useState, createContext } from 'react';

import { Header } from './Header.js';

export type Step = {
  title: string;
  component: FunctionComponent;
};

export type FlowProps<Context> = {
  steps: Step[];
  initialContext: Context;
  initialStep?: number;
  onSubmit?: (context: Context) => void;
};

export type FlowContext<Context> = {
  step: number;
  steps: Step[];
  setStep: (step: number) => void;
  next: () => void;
  context: Context;
  setContext: (context: Context) => void;
};

export const FlowReactContext = createContext<FlowContext<any>>({
  step: 0,
  steps: [],
  setStep: (_step: number) => {
    // no-op
  },
  next: () => {
    // no-op
  },
  context: {},
  setContext: (_context: unknown) => {
    // no-op
  },
});

export const FlowContextProvider = FlowReactContext.Provider;

export const Flow = <Context = Record<string, unknown>,>({
  steps,
  initialContext,
  initialStep = 0,
  onSubmit,
}: FlowProps<Context>) => {
  const [step, setStep] = useState(initialStep);
  const [context, setContext] = useState<Context>(initialContext);

  const { title, component: Component } = steps[step];
  if (!Component) {
    return null;
  }

  const next = () => {
    if (step < steps.length - 1) {
      return setStep(step + 1);
    }

    return onSubmit?.(context);
  };

  return (
    <FlowContextProvider
      value={{
        step,
        steps,
        setStep,
        next,
        context,
        setContext,
      }}
    >
      <Box flexDirection="column">
        <Header currentStep={step} totalSteps={steps.length}>
          {title}
        </Header>
        <Component />
      </Box>
    </FlowContextProvider>
  );
};
