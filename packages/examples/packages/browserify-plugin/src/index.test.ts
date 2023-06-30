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

  describe('hello', () => {
    it('returns "Hello from Browserify!"', async () => {
      const { request, close } = await installSnap();

      const response = await request({
        method: 'hello',
      });

      expect(response).toRespondWith('Hello from Browserify!');

      await close();
    });
  });
});
