import { Image, useColorMode } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import logoDark from '../assets/logo-dark.svg';
import logo from '../assets/logo.svg';

/**
 * Render the Snaps Simulator logo.
 *
 * @returns A React component.
 */
export const Logo: FunctionComponent = () => {
  const { colorMode } = useColorMode();
  return (
    <Image
      src={colorMode === 'light' ? logo : logoDark}
      alt="MetaMask Snaps Simulator"
      height="7"
    />
  );
};
