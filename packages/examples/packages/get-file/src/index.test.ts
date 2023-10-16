import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

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

  describe('getFile', () => {
    it('returns a JSON file', async () => {
      const { request, close } = await installSnap();

      const response = request({
        method: 'getFile',
      });

      expect(await response).toRespondWith({ foo: 'bar' });

      await close();
    });
  });

  describe('getFileInBase64', () => {
    it('returns the file in base64', async () => {
      const { request, close } = await installSnap();

      const response = request({
        method: 'getFileInBase64',
      });

      expect(await response).toRespondWith('ewogICJmb28iOiAiYmFyIgp9Cg==');

      await close();
    });
  });
});
