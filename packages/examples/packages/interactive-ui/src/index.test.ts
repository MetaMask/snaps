import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { address, button, heading, panel, row } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

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

  describe('dialog', () => {
    it('creates a new Snap interface and use it in a confirmation dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');

      expect(ui).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          button({ value: 'Update UI', name: 'update' }),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(true);
    });
  });

  describe('getState', () => {
    it('gets the interface state', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();

      const getStateResponse = await request({
        method: 'getState',
      });

      await ui.ok();

      expect(getStateResponse).toRespondWith({});
    });
  });
});

describe('onHomePage', () => {
  it('returns custom UI', async () => {
    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    expect(response).toRender(
      panel([
        heading('Interactive UI Example Snap'),
        button({ value: 'Update UI', name: 'update' }),
      ]),
    );
  });
});

describe('onTransaction', () => {
  const FROM_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
  const TO_ADDRESS = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';
  it('returns custom UI', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        button({ value: 'See transaction type', name: 'transaction-type' }),
      ]),
    );
  });
});
