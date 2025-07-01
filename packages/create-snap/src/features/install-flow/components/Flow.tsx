import { Box, useInput } from 'ink';
import type { FunctionComponent } from 'react';
import { useEffect, useState, createContext } from 'react';

import { FlowHeader } from './FlowHeader.js';
import { Header } from '../../../components/Header.js';

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
  setContext: (context: Partial<Context>) => void;
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

  useEffect(() => {
    // This is done in `useEffect` to ensure that the context is updated before
    // the `onSubmit` callback is called, allowing the context to be fully
    // populated with the latest values.
    if (step === steps.length && onSubmit) {
      onSubmit(context);
    }
  }, [step, context]);

  const previous = () => {
    if (step > 0) {
      setStep((currentStep) => currentStep - 1);
    }
  };

  const next = () => {
    return setStep((currentStep) => currentStep + 1);
  };

  const setContextWrapper = (newContext: Partial<Context>) => {
    setContext((previousContext) => ({
      ...previousContext,
      ...newContext,
    }));
  };

  useInput((_, key) => {
    if (key.escape) {
      previous();
    }
  });

  const { title, component: Component } = steps[step] ?? {};
  if (!Component) {
    return null;
  }

  return (
    <FlowContextProvider
      value={{
        step,
        steps,
        setStep,
        next,
        context,
        setContext: setContextWrapper,
      }}
    >
      <Box flexDirection="column">
        <FlowHeader currentStep={step} totalSteps={steps.length}>
          {title}
        </FlowHeader>
        <Component />
      </Box>
    </FlowContextProvider>
  );
};
