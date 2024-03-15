import { expect } from '@jest/globals';
import { NodeProcessExecutionService } from '@metamask/snaps-controllers';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap({
      executionService: NodeProcessExecutionService,
    });

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
    // This test is disabled as it is flaky.
    it.skip('fetches a URL and returns the JSON response', async () => {
      const { request } = await installSnap({
        executionService: NodeProcessExecutionService,
      });

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
