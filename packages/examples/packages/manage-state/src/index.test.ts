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

  describe('setState', () => {
    it('sets the state to the params', async () => {
      const { request } = await installSnap();

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
    });

    it('sets the unencrypted state to the params', async () => {
      const { request } = await installSnap();

      expect(
        await request({
          method: 'setState',
          params: {
            items: ['foo'],
            encrypted: false,
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith({
        items: [],
      });

      expect(
        await request({
          method: 'getState',
          params: {
            encrypted: false,
          },
        }),
      ).toRespondWith({
        items: ['foo'],
      });
    });
  });

  describe('getState', () => {
    it('returns the state if no state has been set', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith({
        items: [],
      });
    });

    it('returns the state', async () => {
      const { request } = await installSnap();

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
    });

    it('returns the unencrypted state', async () => {
      const { request } = await installSnap({
        options: {
          unencryptedState: {
            items: ['foo'],
          },
        },
      });

      const response = await request({
        method: 'getState',
        params: {
          encrypted: false,
        },
      });

      expect(response).toRespondWith({
        items: ['foo'],
      });
    });
  });

  describe('clearState', () => {
    it('clears the state', async () => {
      const { request } = await installSnap();

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
    });

    it('clears the unencrypted state', async () => {
      const { request } = await installSnap();

      await request({
        method: 'setState',
        params: {
          items: ['foo'],
          encrypted: false,
        },
      });

      expect(
        await request({
          method: 'clearState',
          params: {
            encrypted: false,
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'getState',
          params: {
            encrypted: false,
          },
        }),
      ).toRespondWith({
        items: [],
      });
    });
  });
});
