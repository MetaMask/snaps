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
            value: {
              items: ['foo'],
            },
          },
        }),
      ).toRespondWith(null);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith({
        items: ['foo'],
      });
    });

    it('sets the state at a specific key', async () => {
      const { request } = await installSnap();

      expect(
        await request({
          method: 'setState',
          params: {
            value: 'foo',
            key: 'nested.key',
          },
        }),
      ).toRespondWith(null);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith({
        nested: {
          key: 'foo',
        },
      });
    });

    it('sets the unencrypted state to the params', async () => {
      const { request } = await installSnap();

      expect(
        await request({
          method: 'setState',
          params: {
            value: {
              items: ['foo'],
            },
            encrypted: false,
          },
        }),
      ).toRespondWith(null);

      expect(
        await request({
          method: 'getState',
        }),
      ).toRespondWith(null);

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

    it('throws if the state is not an object and no key is specified', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'setState',
        params: {
          value: 'foo',
        },
      });

      expect(response).toRespondWithError(
        expect.objectContaining({
          code: -32602,
          message:
            'Invalid params: Value must be an object if key is not provided.',
        }),
      );
    });
  });

  describe('getState', () => {
    it('returns `null` if no state has been set', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith(null);
    });

    it('returns the state', async () => {
      const { request } = await installSnap({
        options: {
          state: {
            items: ['foo'],
          },
        },
      });

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith({
        items: ['foo'],
      });
    });

    it('returns the state at a specific key', async () => {
      const { request } = await installSnap({
        options: {
          state: {
            nested: {
              key: 'foo',
            },
          },
        },
      });

      const response = await request({
        method: 'getState',
        params: {
          key: 'nested.key',
        },
      });

      expect(response).toRespondWith('foo');
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
          value: {
            items: ['foo'],
          },
        },
      });

      await request({
        method: 'clearState',
      });

      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith(null);
    });

    it('clears the unencrypted state', async () => {
      const { request } = await installSnap();

      await request({
        method: 'setState',
        params: {
          value: {
            items: ['foo'],
          },
          encrypted: false,
        },
      });

      await request({
        method: 'clearState',
        params: {
          encrypted: false,
        },
      });

      const response = await request({
        method: 'getState',
        params: {
          encrypted: false,
        },
      });

      expect(response).toRespondWith(null);
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
