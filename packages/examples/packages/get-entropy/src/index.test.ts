import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';

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

  describe('signMessage', () => {
    it('signs a message with the snap entropy', async () => {
      const { request, close } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text('Do you want to sign the following message with snap entropy?'),
          copyable('Hello, world!'),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0x8b3f38050fb60fffd2e0e2ef04504b09e8f0ff46e25896cfd87ced67a5a76ac75c534c9bafbf6f38b6e50b969e1239c80916040de30a3f9ee973d6a3281d39624e7d463b2a5bc0165764b0b4ce8ad009352076c54a202a8c63554b00a46872dc',
      );

      await close();
    });

    it('signs a message with a different salt', async () => {
      const { request, close } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
          salt: 'Other salt',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text('Do you want to sign the following message with snap entropy?'),
          copyable('Hello, world!'),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0x877530880baa4d1fc1fca749f5a26123275ffaa617505cae8f3da4a58d06ea43b7123d4575331dd15ffd5103ed2091050af0aa715adc3b7e122c8e07a97b7fce76c34e8e2ef0037b36015795e0ae530fed264ffb4b33bd47149af192f4c51411',
      );

      await close();
    });
  });
});
