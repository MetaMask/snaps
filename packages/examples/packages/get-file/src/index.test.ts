import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

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

  describe('getFile', () => {
    it('returns a JSON file', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getFile',
      });

      expect(await response).toRespondWith({ foo: 'bar' });
    });
  });

  describe('getFileInBase64', () => {
    it('returns the file in base64', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getFileInBase64',
      });

      expect(await response).toRespondWith('ewogICJmb28iOiAiYmFyIgp9Cg==');
    });
  });

  describe('getFileInHex', () => {
    it('returns the file in hex', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getFileInHex',
      });

      expect(await response).toRespondWith(
        '0x7b0a202022666f6f223a2022626172220a7d0a',
      );
    });
  });
});
