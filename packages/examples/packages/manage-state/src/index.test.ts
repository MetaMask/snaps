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

  describe('legacy_setState', () => {
    it('sets the state to the params', async () => {
      const { request } = await installSnap();

      expect(
        await request({
          method: 'legacy_setState',
          params: {
            items: ['foo'],
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'legacy_getState',
        }),
      ).toRespondWith({
        items: ['foo'],
      });
    });

    it('sets the unencrypted state to the params', async () => {
      const { request } = await installSnap();

      expect(
        await request({
          method: 'legacy_setState',
          params: {
            items: ['foo'],
            encrypted: false,
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'legacy_getState',
        }),
      ).toRespondWith({
        items: [],
      });

      expect(
        await request({
          method: 'legacy_getState',
          params: {
            encrypted: false,
          },
        }),
      ).toRespondWith({
        items: ['foo'],
      });
    });
  });

  describe('legacy_getState', () => {
    it('returns the state if no state has been set', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'legacy_getState',
      });

      expect(response).toRespondWith({
        items: [],
      });
    });

    it('returns the state', async () => {
      const { request } = await installSnap();

      await request({
        method: 'legacy_setState',
        params: {
          items: ['foo'],
        },
      });

      const response = await request({
        method: 'legacy_getState',
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
        method: 'legacy_getState',
        params: {
          encrypted: false,
        },
      });

      expect(response).toRespondWith({
        items: ['foo'],
      });
    });
  });

  describe('legacy_clearState', () => {
    it('clears the state', async () => {
      const { request } = await installSnap();

      await request({
        method: 'legacy_setState',
        params: {
          items: ['foo'],
        },
      });

      expect(
        await request({
          method: 'legacy_clearState',
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'legacy_getState',
        }),
      ).toRespondWith({
        items: [],
      });
    });

    it('clears the unencrypted state', async () => {
      const { request } = await installSnap();

      await request({
        method: 'legacy_setState',
        params: {
          items: ['foo'],
          encrypted: false,
        },
      });

      expect(
        await request({
          method: 'legacy_clearState',
          params: {
            encrypted: false,
          },
        }),
      ).toRespondWith(true);

      expect(
        await request({
          method: 'legacy_getState',
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
