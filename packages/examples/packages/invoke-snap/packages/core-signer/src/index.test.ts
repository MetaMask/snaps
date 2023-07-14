import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import type { Json } from '@metamask/utils';
import { assert, bytesToHex, hasProperty } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';

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

  describe('getAccount', () => {
    it('returns an account for the given derivation path', async () => {
      const { request, close } = await installSnap();

      const response = await request({
        method: 'getAccount',
        params: {
          path: [`bip32:44'`, `bip32:60'`, `bip32:0'`, `bip32:0`, `bip32:0`],
        },
      });

      expect(response).toRespondWith({
        path: [`bip32:44'`, `bip32:60'`, `bip32:0'`, `bip32:0`, `bip32:0`],

        // Because the generated entropy is different for every test run, we
        // cannot assert the public key value. Instead, we assert that the
        // response is a string.
        publicKey: expect.any(String),
      });

      await close();
    });

    it('returns the same account for the same derivation path', async () => {
      const { request, close } = await installSnap();

      const { response } = await request({
        method: 'getAccount',
        params: {
          path: [`bip32:44'`, `bip32:60'`, `bip32:0'`, `bip32:0`, `bip32:0`],
        },
      });

      assert(
        hasProperty(response, 'result'),
        'Expected response to be defined',
      );

      const otherResponse = await request({
        method: 'getAccount',
        params: {
          path: [`bip32:44'`, `bip32:60'`, `bip32:0'`, `bip32:0`, `bip32:0`],
        },
      });

      expect(otherResponse).toRespondWith(response.result);

      await close();
    });
  });

  describe('signMessage', () => {
    it('signs a message with an account', async () => {
      const { request, close } = await installSnap();

      const { response } = await request({
        method: 'getAccount',
        params: {
          path: [`bip32:44'`, `bip32:60'`, `bip32:0'`, `bip32:0`, `bip32:0`],
        },
      });

      assert(
        hasProperty(response, 'result'),
        'Expected response to be defined',
      );

      const account = response.result as Json;
      const hash = sha256('Hello, world!');

      const signResponse = request({
        method: 'signMessage',
        params: {
          account,
          message: bytesToHex(hash),
        },
      });

      const ui = await signResponse.getInterface();
      await ui.ok();

      // Because the generated entropy is different for every test run, we
      // cannot assert the signature value. Instead, we assert that the
      // response is a string.
      expect(await signResponse).toRespondWith(expect.any(String));

      await close();
    });
  });
});
