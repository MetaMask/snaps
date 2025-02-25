import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Copyable, Heading, Text } from '@metamask/snaps-sdk/jsx';
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

  describe('signMessage', () => {
    it('signs a message with the snap entropy', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to sign the following message with Snap entropy, and the
            entropy source "{'Primary source'}"?
          </Text>
          <Copyable value="Hello, world!" />
        </Box>,
      );

      assert(ui.type === 'confirmation');
      await ui.ok();

      expect(await response).toRespondWith(
        '0x8b3f38050fb60fffd2e0e2ef04504b09e8f0ff46e25896cfd87ced67a5a76ac75c534c9bafbf6f38b6e50b969e1239c80916040de30a3f9ee973d6a3281d39624e7d463b2a5bc0165764b0b4ce8ad009352076c54a202a8c63554b00a46872dc',
      );
    });

    it('signs a message with a different salt', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
          salt: 'Other salt',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to sign the following message with Snap entropy, and the
            entropy source "{'Primary source'}"?
          </Text>
          <Copyable value="Hello, world!" />
        </Box>,
      );

      assert(ui.type === 'confirmation');
      await ui.ok();

      expect(await response).toRespondWith(
        '0x877530880baa4d1fc1fca749f5a26123275ffaa617505cae8f3da4a58d06ea43b7123d4575331dd15ffd5103ed2091050af0aa715adc3b7e122c8e07a97b7fce76c34e8e2ef0037b36015795e0ae530fed264ffb4b33bd47149af192f4c51411',
      );
    });

    it('signs a message with a different entropy source', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          message: 'Hello, world!',
          source: 'alternative',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to sign the following message with Snap entropy, and the
            entropy source "{'Alternative Secret Recovery Phrase'}"?
          </Text>
          <Copyable value="Hello, world!" />
        </Box>,
      );

      assert(ui.type === 'confirmation');
      await ui.ok();

      expect(await response).toRespondWith(
        '0xad9bff2fc10e412b1dc3e2f88bc2c0da3c994c4a75cd59b1a92ef18bfd24af459aad5a6355d3030cf44cd52486dc274419177820fdc44b86842a043a3da5aa3a5c07990265891dc871a7cd341b1771282aa042a024810f17ecb6929d731a4013',
      );
    });
  });

  describe('getEntropySources', () => {
    it('returns the entropy sources', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getEntropySources',
      });

      expect(await response).toRespondWith([
        {
          id: 'default',
          name: 'Default Secret Recovery Phrase',
          type: 'mnemonic',
          primary: true,
        },
        {
          id: 'alternative',
          name: 'Alternative Secret Recovery Phrase',
          type: 'mnemonic',
          primary: false,
        },
      ]);
    });
  });
});
