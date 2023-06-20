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

  describe('setState', () => {
    it('sets the state to the params', async () => {
      const { request, close } = await installSnap();

      expect(
        await request({
          method: 'setState',
          params: {
            items: ['foo'],
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith({
        items: ['foo'],
      });

      await close();
    });
  });

  describe('getState', () => {
    it('returns the state if no state has been set', async () => {
      const { request, close } = await installSnap();

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith({
        items: [],
      });

      await close();
    });

    it('returns the state', async () => {
      const { request, close } = await installSnap();

      await request({
        method: 'setState',
        params: {
          items: ['foo'],
        },
      });

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith({
        items: ['foo'],
      });

      await close();
    });
  });

  describe('clearState', () => {
    it('clears the state', async () => {
      const { request, close } = await installSnap();

      await request({
        method: 'setState',
        params: {
          items: ['foo'],
        },
      });

      expect(
        await request({
          method: 'clearState',
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith({
        items: [],
      });

      await close();
    });
  });
});
