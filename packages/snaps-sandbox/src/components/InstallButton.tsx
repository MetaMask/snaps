import { Button } from '@chakra-ui/react';
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
    <Button onClick={install} loading={installing}>
      <Fox boxSize="1.5rem" /> Install Snap
    </Button>
  );
};
