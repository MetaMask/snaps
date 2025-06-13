import { describe, expect, it } from '@jest/globals';
import { assertIsAlertDialog, installSnap } from '@metamask/snaps-jest';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

describe('onStart', () => {
  it('shows dialog when the client is started', async () => {
    const { onStart } = await installSnap();

    const response = onStart();

    const screen = await response.getInterface();
    assertIsAlertDialog(screen);

    expect(screen).toRender(
      <Box>
        <Text>
          The client was started successfully, and the "onStart" handler was
          called.
        </Text>
      </Box>,
    );

    await screen.ok();

    expect(await response).toRespondWith(null);
  });
});

describe('onInstall', () => {
  it('shows dialog when the snap is installed', async () => {
    const { onInstall } = await installSnap();

    const response = onInstall();

    const screen = await response.getInterface();
    assertIsAlertDialog(screen);

    expect(screen).toRender(
      <Box>
        <Text>
          The Snap was installed successfully, and the "onInstall" handler was
          called.
        </Text>
      </Box>,
    );

    await screen.ok();

    expect(await response).toRespondWith(null);
  });
});

describe('onUpdate', () => {
  it('shows dialog when the snap is updated', async () => {
    const { onUpdate } = await installSnap();

    const response = onUpdate();

    const screen = await response.getInterface();
    assertIsAlertDialog(screen);

    expect(screen).toRender(
      <Box>
        <Text>
          The Snap was updated successfully, and the "onUpdate" handler was
          called.
        </Text>
      </Box>,
    );

    await screen.ok();

    expect(await response).toRespondWith(null);
  });
});
