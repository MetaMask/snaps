import { expect } from '@jest/globals';
import { assertIsConfirmationDialog, installSnap } from '@metamask/snaps-jest';
import { Box, Copyable, Heading, Text } from '@metamask/snaps-sdk/jsx';

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

  describe('getPublicKey', () => {
    it('returns a BIP-44 public key for a given coin type and address index', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          coinType: 3,
          addressIndex: 5,
        },
      });

      expect(response).toRespondWith(
        '0x96e2b36a8af526928326683f6d8ddb82fbfcd1ba1cd3f0382a4f092a19fcb46b87e836dd34075514c9b1a3b8f7bdc4f0',
      );
    });

    it('returns a BIP-44 public key for a given coin type and address index with a different source', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          coinType: 3,
          addressIndex: 5,
          source: 'alternative',
        },
      });

      expect(response).toRespondWith(
        '0xadf494f336c373de010491dfb442a9dda4b6f640fbb81f0139deed7edb236817eaf8621722b01553134c4c91fbe89c45',
      );
    });

    it('returns a BIP-44 public key for the default coin type and address index if no parameters are provided', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
      });

      expect(response).toRespondWith(
        '0xa9ad546540fca1662bdf3de110a456f2d825271e6d960cc5028224d4dc37c0e7fdd806b22fe94d9325548933e9c1ee68',
      );
    });

    it('throws an error when trying to use a coin type that is not in the snap manifest', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          coinType: 2,
        },
      });

      expect(response).toRespondWithError({
        code: 4100,
        message:
          'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.',
        stack: expect.any(String),
      });
    });
  });

  describe('signMessage', () => {
    it('signs a message for the given coin type and address index', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          coinType: 3,
          addressIndex: 5,
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      assertIsConfirmationDialog(ui);

      expect(ui).toRender(
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to BLS sign "{'Hello, world!'}" with the following
            public key?
          </Text>
          <Copyable value="0x96e2b36a8af526928326683f6d8ddb82fbfcd1ba1cd3f0382a4f092a19fcb46b87e836dd34075514c9b1a3b8f7bdc4f0" />
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0xa02ae3c1ecb58e91a9a1ca9184f06a1df68ac19539147011f43717cc480489340e4a4f64b4fd2b64399ee68c1b0afddb18011d97998cd0c61baed0195710e77a949cc8a0f398319294ff6e3e0752c199bd5d553a17ce5b5e3e45015fc5acb16b',
      );
    });

    it('signs a message for the given coin type and address index with a different source', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          coinType: 3,
          addressIndex: 5,
          message: 'Hello, world!',
          source: 'alternative',
        },
      });

      const ui = await response.getInterface();
      assertIsConfirmationDialog(ui);

      expect(ui).toRender(
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to BLS sign "{'Hello, world!'}" with the following
            public key?
          </Text>
          <Copyable value="0xadf494f336c373de010491dfb442a9dda4b6f640fbb81f0139deed7edb236817eaf8621722b01553134c4c91fbe89c45" />
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0xb01b6dd84f1aae227b25f8679d739508112c304819276843d057806e436cc0ccba16966e7b5b1bef1d55699531f31ed40908ce2a8d349e0bb5a8a5d840fb928b3fad499c6f117afdc740ac205d76c1ece8d4134822f88156243e926ddac99ab0',
      );
    });

    it('signs a message using the default coin type and address index', async () => {
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
        <Box>
          <Heading>Signature request</Heading>
          <Text>
            Do you want to BLS sign "{'Hello, world!'}" with the following
            public key?
          </Text>
          <Copyable value="0xa9ad546540fca1662bdf3de110a456f2d825271e6d960cc5028224d4dc37c0e7fdd806b22fe94d9325548933e9c1ee68" />
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0xb3e2957f99e32bd2c98905ba20ce8c12413163fe46004f4d327e77fb001497241fbaec67869890a52347b82260e1fbf815df5b446123e1c0389bf5f5322095520c5f847f941f97bb177a15bfd14b3fe4690c3a609d45cd3dfbafa6c834ef0eb4',
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
