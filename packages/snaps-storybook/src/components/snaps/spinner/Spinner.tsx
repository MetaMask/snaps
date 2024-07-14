import { Spinner as ChakraSpinner } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

/**
 * A spinner component, which is used to indicate that a process is in progress.
 *
 * @returns The spinner element.
 */
export const Spinner: FunctionComponent = () => (
  <ChakraSpinner width="50px" height="50px" />
);
