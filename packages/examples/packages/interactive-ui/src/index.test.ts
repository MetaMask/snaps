import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { button, heading, panel } from '@metamask/snaps-sdk';
import { assert, hasProperty } from '@metamask/utils';

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

      expect(await response).toRespondWith(expect.any(String));
    });
  });

  describe('get_state', () => {
    it('gets the interface state', async () => {
      const { request } = await installSnap();

      const { response } = await request({
        method: 'dialog',
      });

      assert(hasProperty(response, 'result'));

      const id = response.result as string;

      const getStateResponse = await request({
        method: 'get_state',
        params: {
          id,
        },
      });

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
  it('returns custom UI', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({});

    expect(response).toRender(
      panel([
        heading('Interactive UI Example Snap'),
        button({ value: 'Update UI', name: 'update' }),
      ]),
    );
  });
});
