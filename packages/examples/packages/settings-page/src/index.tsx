import type { OnSettingsPageHandler } from '@metamask/snaps-sdk';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

/**
 * Handle incoming settings page requests from the MetaMask clients.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onsettingspage
 */
export const onSettingsPage: OnSettingsPageHandler = async () => {
  return {
    content: (
      <Box>
        <Heading>Hello world!</Heading>
        <Text>Welcome to my Snap settings page!</Text>
      </Box>
    ),
  };
};
