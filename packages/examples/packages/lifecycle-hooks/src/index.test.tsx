import { describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

describe('onInstall', () => {
  it('shows dialog when the snap is installed', async () => {
    const { onInstall } = await installSnap();

    const response = await onInstall();

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Text>
          The Snap was installed successfully, and the "onInstall" handler was
          called.
        </Text>
      </Box>,
    );
  });
});

describe('onUpdate', () => {
  it('shows dialog when the snap is updated', async () => {
    const { onUpdate } = await installSnap();

    const response = await onUpdate();

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Text>
          The Snap was updated successfully, and the "onUpdate" handler was
          called.
        </Text>
      </Box>,
    );
  });
});
