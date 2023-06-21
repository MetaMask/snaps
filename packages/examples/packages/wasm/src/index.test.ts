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

  describe('fibonacci', () => {
    it('loads a WASM module and returns the result of the fibonacci function', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'fibonacci',
        params: [10],
      });

      expect(response).toRespondWith(55);
    });
  });
});
