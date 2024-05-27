import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { copyable, heading, panel, text } from '@metamask/snaps-sdk';
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

  describe('getPublicKey', () => {
    it('returns an secp256k1 public key for a given BIP-32 path', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'secp256k1',
        },
      });

      expect(response).toRespondWith(
        '0x0423a6a6f8800b2d0710595969f40148a28953c9eebc0c0da78a89be3b3935f59c0069dfe1cace1a083e9c962c9f2ef932e9346cd907e647d993d787c4e59d03d1',
      );
    });

    it('returns a compressed secp256k1 public key for a given BIP-32 path', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'secp256k1',
          compressed: true,
        },
      });

      expect(response).toRespondWith(
        '0x0323a6a6f8800b2d0710595969f40148a28953c9eebc0c0da78a89be3b3935f59c',
      );
    });

    it('throws an error when trying to use an secp256k1 derivation path that is not in the snap manifest', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          path: ['m', "44'", "1'"],
          curve: 'secp256k1',
        },
      });

      expect(response).toRespondWithError({
        code: 4100,
        message:
          'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
        stack: expect.any(String),
      });
    });

    it('throws an error when trying to use an ed25519 derivation path', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPublicKey',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'ed25519',
        },
      });

      expect(response).toRespondWithError({
        code: 4100,
        message:
          'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
        stack: expect.any(String),
      });
    });
  });

  describe('signMessage', () => {
    it('signs a message for the given BIP-32 path using secp256k1', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'secp256k1',
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text(
            `Do you want to secp256k1 sign "Hello, world!" with the following public key?`,
          ),
          copyable(
            '0x0423a6a6f8800b2d0710595969f40148a28953c9eebc0c0da78a89be3b3935f59c0069dfe1cace1a083e9c962c9f2ef932e9346cd907e647d993d787c4e59d03d1',
          ),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0x3045022100e311ecb220500bc845b772a8a07c2a7f8224ce6ca281c8c9a6e3fb35a80b994e0220184c787e4de8d51e3a697d7d3825e78e2606ab1a1b555d80185359233517dc1f',
      );
    });

    it('signs a message for the given BIP-32 path using ed25519', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'ed25519',
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text(
            `Do you want to ed25519 sign "Hello, world!" with the following public key?`,
          ),
          copyable(
            '0x000b96ba23cae9597de51e0187d7ef1b2d1a782dc2d5ceac770a327de3844dd533',
          ),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0xa89e650e61fa406c9cc62f13991ba3470304a794823d7e4b080cc4919843219963be8a5d18f092f5bccfa20259f66f26305a3af32fded4f7c91140bcd565a80b',
      );
    });

    it('signs a message for the given BIP-32 path using ed25519Bip32', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'ed25519Bip32',
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      expect(ui).toRender(
        panel([
          heading('Signature request'),
          text(
            `Do you want to ed25519Bip32 sign "Hello, world!" with the following public key?`,
          ),
          copyable(
            '0x2c3ac523b470dead7981df46c93d894ed4381e94c23aa1ec3806a320ff8ceb42',
          ),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(
        '0x5c01bf4c314a74d3feb27b261637837740e167cf3261fe0bc89dcdbf97888276be030a84298087c031141c1093647768de5b35c1154ec485cb08373a72574902',
      );
    });

    it('throws an error when rejecting the signature request', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'signMessage',
        params: {
          path: ['m', "44'", "0'"],
          curve: 'secp256k1',
          message: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');
      await ui.cancel();

      expect(await response).toRespondWithError({
        code: 4001,
        message: 'User rejected the request.',
        stack: expect.any(String),
      });
    });
  });
});
