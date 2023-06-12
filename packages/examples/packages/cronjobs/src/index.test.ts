import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { heading, panel, text } from '@metamask/snaps-ui';

describe('onCronjob', () => {
  describe('execute', () => {
    it('shows a dialog', async () => {
      const { runCronjob } = await installSnap();

      const request = runCronjob({
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
