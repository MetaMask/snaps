import { Spinner as ChakraSpinner } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

export type SpinnerProps = {
  id: string;
  node: unknown;
};

export const Spinner: FunctionComponent<SpinnerProps> = ({ id }) => (
  <ChakraSpinner key={`${id}-spinner`} />
);
