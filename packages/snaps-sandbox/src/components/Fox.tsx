import type { ImageProps } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import fox from '../assets/fox.svg';

/**
 * The props for the {@link Fox} component.
 */
export type FoxProps = Omit<ImageProps, 'src'>;

/**
 * The MetaMask fox logo.
 *
 * @param props - The component props. The props are passed to the Chakra UI
 * {@link Image} component.
 * @returns The MetaMask fox logo.
 */
export const Fox: FunctionComponent<FoxProps> = (props) => {
  return <Image alt="MetaMask logo" {...props} src={fox} />;
};
