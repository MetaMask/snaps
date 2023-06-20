import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { DEFAULT_URL } from './constants';

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

  describe('fetch', () => {
    it('fetches a URL and returns the JSON response', async () => {
      const { request, close, mock } = await installSnap();

      await mock({
        url: DEFAULT_URL,
        response: {
          contentType: 'application/json',
          body: JSON.stringify({
            hello: 'world',
          }),
        },
      });

      const response = await request({
        method: 'fetch',
      });

      expect(response).toRespondWith({
        hello: 'world',
      });

      await close();
    });

    it('fetches a custom URL and returns the JSON response', async () => {
      const { request, close, mock } = await installSnap();

      await mock({
        url: 'https://example.com/',
        response: {
          contentType: 'application/json',
          body: JSON.stringify({
            foo: 'bar',
          }),
        },
      });

      const response = await request({
        method: 'fetch',
        params: {
          url: 'https://example.com/',
        },
      });

      expect(response).toRespondWith({
        foo: 'bar',
      });

      await close();
    });
  });
});
