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

  describe('status', () => {
    it('returns the result from snap_getClientStatus', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'status',
      });

      expect(response).toRespondWith({
        locked: false,
      });
    });
  });
});
