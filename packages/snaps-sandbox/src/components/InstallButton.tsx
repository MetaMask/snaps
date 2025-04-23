import { Button, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Fox } from './Fox';
import { useInstall } from '../hooks';

/**
 * A button that installs the Snap.
 *
 * @returns The install button component.
 */
export const InstallButton: FunctionComponent = () => {
  const { loading: installing, install } = useInstall();

  return (
    <Button colorScheme="info" onClick={install} loading={installing}>
      <HStack>
        <Fox boxSize="1.25rem" />
        Install Snap
      </HStack>
    </Button>
  );
};
