import { describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

describe('onSettingsPage', () => {
  it('returns custom UI', async () => {
    const { onSettingsPage } = await installSnap();

    const response = await onSettingsPage();

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Heading>Hello world!</Heading>
        <Text>Welcome to my Snap settings page!</Text>
      </Box>,
    );
  });
});
