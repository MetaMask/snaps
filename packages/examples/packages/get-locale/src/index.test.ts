import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { heading, panel, text } from '@metamask/snaps-ui';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      },
    });

    await close();
  });

  describe('hello', () => {
    it('shows an alert with a localized message', async () => {
      const { request, close } = await installSnap();

      const response = request({
        method: 'hello',
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([heading('Hello metamask.io!'), text('This is a dialog!')]),
      );

      await ui.ok();

      expect(await response).toRespondWith(null);

      await close();
    });
  });
});
