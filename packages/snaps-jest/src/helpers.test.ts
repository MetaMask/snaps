import { installSnap } from './helpers';

// TODO: Run a server that serves a local Snap, and test that instead, to avoid
// requests to NPM.
const SNAP_ID = 'npm:@metamask/localization-example-snap';

describe('installSnap', () => {
  it('installs a Snap and returns the request functions', async () => {
    const { request, close } = await installSnap(SNAP_ID);
    const response = await request({
      method: 'hello',
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        result: 'Hello, world!',
      },
      notifications: [],
    });

    await close();
  });

  describe('request', () => {
    it('sends a JSON-RPC request to the Snap and returns the result', async () => {
      const { request, close } = await installSnap(SNAP_ID);
      const response = await request({
        method: 'hello',
      });

      expect(response).toStrictEqual({
        id: expect.any(String),
        response: {
          result: 'Hello, world!',
        },
        notifications: [],
      });

      await close();
    });

    it('sends a JSON-RPC request to the Snap and returns the error', async () => {
      const { request, close } = await installSnap(SNAP_ID);
      const response = await request({
        method: 'foo',
      });

      expect(response).toStrictEqual({
        id: expect.any(String),
        response: {
          error: expect.objectContaining({
            code: -32601,
            message: 'The method does not exist / is not available.',
            data: expect.objectContaining({
              method: 'foo',
            }),
          }),
        },
        notifications: [],
      });

      await close();
    });
  });
});
