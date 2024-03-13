import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-sdk';
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

  describe('showAlert', () => {
    it('shows an alert dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showAlert',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'alert');

      expect(ui).toRender(panel([text('Hello from **JSX**.')]));

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });
});
