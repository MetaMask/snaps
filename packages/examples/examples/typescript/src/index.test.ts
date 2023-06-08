import { expect } from '@jest/globals';
import { installSnap, NotificationType } from '@metamask/snaps-jest';

jest.setTimeout(60000);

describe('onRpcRequest', () => {
  describe('hello', () => {
    it('sends a notification', async () => {
      const { request, close } = await installSnap();
      const response = request({
        method: 'hello',
        origin: 'foo',
      });

      const resolved = await response;

      expect(resolved).toSendNotification(
        'Hello, foo!',
        NotificationType.InApp,
      );
      expect(resolved).toRespondWith(null);

      await close();
    });
  });

  it('throws an error for unknown request methods', async () => {
    const { request, close } = await installSnap();
    const response = await request({
      method: 'foo',
    });

    await expect(response).toRespondWithError({
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'Method not found.',
          stack: expect.any(String),
        },
      },
    });

    await close();
  });
});
