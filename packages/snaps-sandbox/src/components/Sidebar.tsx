import { Stack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { History } from './History';
import { Logo } from './Logo';

/**
 * The sidebar component of the Snaps Sandbox.
 *
 * @returns The sidebar component.
 */
export const Sidebar: FunctionComponent = () => {
  return (
    <Stack
      width="20.813rem"
      height="100vh"
      backgroundColor="background.muted"
      padding="6"
      gap="6"
    >
      <Logo />
      <History />
    </Stack>
  );
};
