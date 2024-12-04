import { describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

describe('onHomePage', () => {
  it('returns custom UI', async () => {
    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    const screen = response.getInterface();

    await screen.clickElement('footer_button');

    const newUi = response.getInterface();

    expect(newUi).toRender(
      <Box>
        <Text>Footer button was pressed</Text>
      </Box>,
    );
  });
});
