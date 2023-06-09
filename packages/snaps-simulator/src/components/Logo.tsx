import { Image } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

import logo from '../assets/logo.svg';

/**
 * Render the MetaMask logo.
 *
 * @returns A React component.
 */
export const Logo: FunctionComponent = () => (
  <Image src={logo} alt="MetaMask" height="7" />
);
