import { expect } from '@jest/globals';
import { assertIsConfirmationDialog, installSnap } from '@metamask/snaps-jest';
import { copyable, heading, panel, text } from '@metamask/snaps-sdk';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('getAddress', () => {
    it('returns the address for the snap private key', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getAddress',
      });

      expect(response).toRespondWith(
        '0x18F8f628a1b1480F6E7b15C731C19913D1B37964',
      );
    });
  });

  describe('signMessage', () => {
    it('signs a message', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      assertIsConfirmationDialog(ui);

      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text(`Do you want to sign this message?`),
          copyable('Hello, world!'),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0x7d85a4559acf7e3dd6893eb62cae5d25a9282f6aca74d91cadeb867f3f6b498106330492ee3df7c458c83046003dea3d0c8650a3a7b8be942bc228fe21dec7df1b',
      );
    });

    it('throws an error when rejecting the signature request', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      assertIsConfirmationDialog(ui);
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: 'User rejected the request.',
        stack: expect.any(String),
      });
    });
  });
});
