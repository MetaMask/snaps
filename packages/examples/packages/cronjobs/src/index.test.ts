import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { heading, panel, text } from '@metamask/snaps-sdk';

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
        panel([
          heading('Cronjob'),
          text('This dialog was triggered by a cronjob.'),
        ]),
      );

      await ui.ok();

      const response = await request;
      expect(response).toRespondWith(null);
    });
  });
});
