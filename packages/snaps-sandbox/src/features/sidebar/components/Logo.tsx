import { Heading, HStack, Image } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import fox from '../../../assets/fox.svg';

/**
 * The MetaMask logo and title.
 *
 * @returns The logo component.
 */
export const Logo: FunctionComponent = () => {
  return (
    <HStack gap="4" marginBottom="4">
      <Image src={fox} alt="MetaMask Logo" boxSize="2.25rem" />
      <Heading as="h1">Snaps Sandbox</Heading>
    </HStack>
  );
};
