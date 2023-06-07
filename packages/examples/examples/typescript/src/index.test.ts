import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { text } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

jest.setTimeout(60000);

describe('onRpcRequest', () => {
  describe('hello', () => {
    it('sends a notification', async () => {
      const { request } = await installSnap('local:http://localhost:8086');
      const response = request({
        method: 'hello',
        origin: 'foo',
      });

      const resolved = await response;

      expect(resolved).toSendNotification('Hello, foo!');
      expect(resolved).toRespondWith(null);
    });
  });

  describe('confirm', () => {
    it('shows a confirmation dialog', async () => {
      const { request } = await installSnap('local:http://localhost:8086');
      const response = request({
        method: 'confirm',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');

      expect(ui).toRender(text('OK?'));
      await ui.ok();

      expect(await response).toRespondWith(true);
    });

    it('returns false if the user cancels the confirmation', async () => {
      const { request } = await installSnap('local:http://localhost:8086');
      const response = request({
        method: 'confirm',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');
      await ui.cancel();

      expect(await response).toRespondWith(false);
    });
  });

  it('throws an error for unknown request methods', async () => {
    const { request } = await installSnap('local:http://localhost:8086');
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
  });
});
