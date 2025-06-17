import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { NotificationType } from '@metamask/snaps-sdk';

describe('onCronjob', () => {
  describe('execute', () => {
    it('shows a notification', async () => {
      const { onCronjob } = await installSnap();

      const response = await onCronjob({
        // This would normally be called by the MetaMask extension, but to make
        // this testable, `@metamask/snaps-jest` exposes a `onCronjob` method.
        method: 'execute',
      });

      expect(response).toSendNotification(
        'This notification was triggered by a cronjob using an ISO 8601 duration.',
        NotificationType.InApp,
      );

      expect(response).toRespondWith(null);
    });
  });
});
