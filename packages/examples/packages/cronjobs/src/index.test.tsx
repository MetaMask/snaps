import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

describe('onCronjob', () => {
  describe('execute', () => {
    it('shows a dialog', async () => {
      const { onCronjob } = await installSnap();

      const request = onCronjob({
        // This would normally be called by the MetaMask extension, but to make
        // this testable, `@metamask/snaps-jest` exposes a `runCronjob` method.
        method: 'execute',
      });

      const ui = await request.getInterface();

      expect(ui).toRender(
        <Box>
          <Heading>Cronjob</Heading>
          <Text>This dialog was triggered by a cronjob.</Text>
        </Box>,
      );

      // TODO(ritave): Fix types in SnapInterface
      await (ui as any).ok();

      const response = await request;
      expect(response).toRespondWith(null);
    });
  });
});
