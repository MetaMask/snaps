import { Stack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { History, Logo, Settings } from './components';
import { Documentation } from './components/Documentation';

/**
 * The sidebar component of the Snaps Sandbox.
 *
 * @returns The sidebar component.
 */
export const Sidebar: FunctionComponent = () => {
  return (
    <Stack
      width="22.375rem"
      height="100vh"
      backgroundColor="background.muted"
      padding="6"
      gap="6"
    >
      <Logo />
      <History />
      <Stack gap="4">
        <Documentation />
        <Settings />
      </Stack>
    </Stack>
  );
};
