import { expect } from '@jest/globals';
import { installSnap, assertIsCustomDialog } from '@metamask/snaps-jest';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

describe('onCronjob', () => {
  describe('fireDialog', () => {
    it('shows a dialog', async () => {
      const { onBackgroundEvent } = await installSnap();

      const response = onBackgroundEvent({
        // This would normally be called by the MetaMask extension, but to make
        // this testable, `@metamask/snaps-jest` exposes a `onBackgroundEvent` method.
        method: 'fireDialog',
      });

      const ui = await response.getInterface();
      assertIsCustomDialog(ui);

      expect(ui).toRender(
        <Box>
          <Text>This dialog was triggered by a background event</Text>
        </Box>,
      );
    });
  });
});
