import { NodeProcessExecutionService } from '@metamask/snaps-controllers';
import { DialogType } from '@metamask/snaps-sdk';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import { installSnap } from './helpers';
import { handleInstallSnap } from './internals';
import { getMockServer } from './test-utils/server';

Object.defineProperty(global, 'snapsEnvironment', {
  value: {
    installSnap: handleInstallSnap,
  },
});

describe('installSnap', () => {
  it('installs a Snap and returns the request functions', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = () => {
          return 'Hello, world!';
        };
      `,
    });

    const { request, close } = await installSnap(snapId);
    const response = await request({
      method: 'hello',
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'Hello, world!',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('installs a Snap into a custom execution environment', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    const { request, close } = await installSnap(snapId, {
      executionService: NodeProcessExecutionService,
      options: {
        locale: 'nl',
      },
    });

    const response = await request({
      method: 'hello',
      params: {
        foo: 'bar',
      },
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'Hello, world!',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('allows specifying the locale', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return await snap.request({
            method: 'snap_getLocale',
          });
        };
      `,
      manifest: getSnapManifest({
        initialPermissions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_getLocale: {},
        },
      }),
    });

    const { request, close } = await installSnap(snapId, {
      options: {
        locale: 'nl',
      },
    });

    const response = await request({
      method: 'hello',
      params: {
        foo: 'bar',
      },
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'nl',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('allows specifying initial state', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'get',
            },
          });
        };
      `,
      manifest: getSnapManifest({
        initialPermissions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_manageState: {},
        },
      }),
    });

    const { request, close } = await installSnap(snapId, {
      options: {
        state: {
          foo: 'bar',
        },
      },
    });

    const response = await request({
      method: 'hello',
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: {
            foo: 'bar',
          },
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  describe('request', () => {
    it('sends a JSON-RPC request to the Snap and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = (request) => {
            return {
              request
            };
          };
        `,
      });

      const { request, close } = await installSnap(snapId);
      const response = await request({
        method: 'hello',
        params: {
          foo: 'bar',
        },
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              request: {
                origin: 'https://metamask.io',
                request: {
                  id: 1,
                  jsonrpc: '2.0',
                  method: 'hello',
                  params: {
                    foo: 'bar',
                  },
                },
              },
            },
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });

    it('sends a JSON-RPC request to the Snap and returns the error', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = ({ origin }) => {
            throw new Error('Something went wrong!');
          };
        `,
      });

      const { request, close } = await installSnap(snapId);
      const response = await request({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            error: expect.objectContaining({
              code: -32603,
              message: 'Something went wrong!',
            }),
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });

    it('handles alert dialogs', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'prompt',
                content: {
                  type: 'text',
                  value: 'Hello, world!',
                },
              },
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        }),
      });

      const { request, close } = await installSnap(snapId);
      const response = request({
        method: 'foo',
      });

      const ui = await response.getInterface();
      assert(ui.type === DialogType.Prompt);
      expect(ui).toStrictEqual({
        type: DialogType.Prompt,
        content: {
          type: 'text',
          value: 'Hello, world!',
        },
        ok: expect.any(Function),
        cancel: expect.any(Function),
      });

      await ui.ok('foo');
      expect(await response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'foo',
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });

    it('handles confirmation dialogs', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'confirmation',
                content: {
                  type: 'text',
                  value: 'Hello, world!',
                },
              },
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        }),
      });

      const { request, close } = await installSnap(snapId);
      const response = request({
        method: 'foo',
      });

      const ui = await response.getInterface();
      assert(ui.type === DialogType.Confirmation);
      expect(ui).toStrictEqual({
        type: DialogType.Confirmation,
        content: {
          type: 'text',
          value: 'Hello, world!',
        },
        ok: expect.any(Function),
        cancel: expect.any(Function),
      });

      await ui.cancel();
      expect(await response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: false,
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });

    it('handles prompt dialogs', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: {
                  type: 'text',
                  value: 'Hello, world!',
                },
              },
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        }),
      });

      const { request, close } = await installSnap(snapId);
      const response = request({
        method: 'foo',
      });

      const ui = await response.getInterface();
      expect(ui).toStrictEqual({
        type: DialogType.Alert,
        content: {
          type: 'text',
          value: 'Hello, world!',
        },
        ok: expect.any(Function),
      });

      await ui.ok();
      expect(await response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: null,
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });

    it('allows specifying the origin', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = ({ origin }) => {
            return origin;
          };
        `,
      });

      const { request, close } = await installSnap(snapId);
      const response = await request({
        method: 'hello',
        origin: 'https://example.com',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'https://example.com',
          },
        }),
      );

      // `close` is deprecated because the Jest environment will automatically
      // close the Snap when the test finishes. However, we still need to close
      // the Snap in this test because it's run outside the Jest environment.
      await close();
      await closeServer();
    });
  });
});
