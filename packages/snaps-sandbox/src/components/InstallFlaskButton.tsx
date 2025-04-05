import { Button, Link } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Fox } from './Fox';

/**
 * A button that links to the MetaMask Flask installation instructions.
 *
 * @returns The install Flask button component.
 */
export const InstallFlaskButton: FunctionComponent = () => {
  return (
    <Button asChild={true}>
      <Link
        href="https://docs.metamask.io/snaps/get-started/install-flask/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Fox boxSize="1.5rem" /> Install MetaMask Flask
      </Link>
    </Button>
  );
};
