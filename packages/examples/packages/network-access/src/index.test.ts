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

  describe('fetch', () => {
    it('fetches a URL and returns the JSON response', async () => {
      const { request } = await installSnap();

      const url = 'https://dummyjson.com/http/200';
      const response = await request({
        method: 'fetch',
        params: {
          url,
        },
      });

      expect(response).toRespondWith({
        status: '200',
        message: 'OK',
      });
    });
  });
});
