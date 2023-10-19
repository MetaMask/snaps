import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

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

    await close();
  });

  describe('fetch', () => {
    it('fetches a URL and returns the JSON response', async () => {
      const { request, close, mock } = await installSnap();

      const url = 'https://example.com/';

      await mock({
        url,
        response: {
          contentType: 'application/json',
          body: JSON.stringify({
            hello: 'world',
          }),
        },
      });

      const response = await request({
        method: 'fetch',
        params: {
          url,
        },
      });

      expect(response).toRespondWith({
        hello: 'world',
      });

      await close();
    });
  });
});
