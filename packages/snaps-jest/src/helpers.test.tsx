import { NodeProcessExecutionService } from '@metamask/snaps-controllers/node';
import { DialogType } from '@metamask/snaps-sdk';
import { Text } from '@metamask/snaps-sdk/jsx';
import type { InstallSnapOptions } from '@metamask/snaps-simulation';
import {
  assertIsAlertDialog,
  assertIsConfirmationDialog,
  assertIsPromptDialog,
  installSnap as simulateSnap,
} from '@metamask/snaps-simulation';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';

import {
  getMockAccount,
  getStateFromAccount,
  getStateFromAsset,
  installSnap,
} from './helpers';
import { getMockServer } from './test-utils';

describe('installSnap', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'snapsEnvironment', {
      writable: true,
      value: {
        installSnap: simulateSnap,
      },
    });
  });

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

  it('accepts the options as an object', async () => {
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

    Object.defineProperty(global, 'snapsEnvironment', {
      writable: true,
      value: {
        installSnap: async (_: string, options: InstallSnapOptions<any>) => {
          return simulateSnap(snapId, options);
        },
      },
    });

    const { request, close } = await installSnap({
      options: {
        locale: 'nl',
      },
    });

    const response = await request({
      method: 'hello',
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

  it('works without options', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    Object.defineProperty(global, 'snapsEnvironment', {
      writable: true,
      value: {
        installSnap: async (_: string, options: InstallSnapOptions<any>) => {
          return simulateSnap(snapId, options);
        },
      },
    });

    const { request, close } = await installSnap();

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
      assertIsPromptDialog(ui);
      expect(ui).toStrictEqual({
        type: DialogType.Prompt,
        content: <Text>Hello, world!</Text>,
        clickElement: expect.any(Function),
        pickDateTime: expect.any(Function),
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
        waitForUpdate: expect.any(Function),
        id: expect.any(String),
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
      assertIsConfirmationDialog(ui);
      expect(ui).toStrictEqual({
        type: DialogType.Confirmation,
        content: <Text>Hello, world!</Text>,
        clickElement: expect.any(Function),
        pickDateTime: expect.any(Function),
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
        waitForUpdate: expect.any(Function),
        id: expect.any(String),
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
      assertIsAlertDialog(ui);
      expect(ui).toStrictEqual({
        type: DialogType.Alert,
        content: <Text>Hello, world!</Text>,
        clickElement: expect.any(Function),
        pickDateTime: expect.any(Function),
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
        waitForUpdate: expect.any(Function),
        id: expect.any(String),
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

  describe('sendTransaction', () => {
    it('sends a transaction and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onTransaction = async ({ transaction }) => {
            return {
              content: {
                type: 'text',
                value: 'Hello, world! (value: ' + transaction.value + ')',
              },
            };
          };
         `,
      });

      const { sendTransaction, close } = await installSnap(snapId);
      const response = await sendTransaction({
        value: '0x1',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              content: {
                type: 'text',
                value: 'Hello, world! (value: 0x01)',
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
  });

  describe('onSignature', () => {
    it('sends a signature request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onSignature = async ({ signature }) => {
            return {
              content: {
                type: 'text',
                value: 'You are using the ' + signature.signatureMethod + ' method.',
              },
              severity: 'critical',
            };
          };
         `,
      });

      const { onSignature, close } = await installSnap(snapId);
      const response = await onSignature({
        signatureMethod: 'personal_sign',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              content: {
                type: 'text',
                value: 'You are using the personal_sign method.',
              },
              severity: 'critical',
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
  });

  describe('onNameLookup', () => {
    it('sends a name lookup request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const MOCK_DOMAIN = 'test.domain';

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onNameLookup = async (request) => {
            return {
              resolvedAddress: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
              protocol: 'test protocol',
              domainName: request.domain,
            };
          };
         `,
      });

      const { onNameLookup, close } = await installSnap(snapId);
      const response = await onNameLookup({
        chainId: 'eip155:1',
        domain: MOCK_DOMAIN,
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              resolvedAddress: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
              protocol: 'test protocol',
              domainName: MOCK_DOMAIN,
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
  });

  describe('runCronjob', () => {
    it('runs a cronjob and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onCronjob = async ({ request }) => {
            return request.method;
          };
         `,
      });

      const { runCronjob, close } = await installSnap(snapId);
      const response = await runCronjob({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'foo',
          },
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('onBackgroundEvent', () => {
    it('runs a cronjob and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onCronjob = async ({ request }) => {
            return request.method;
          };
         `,
      });

      const { onBackgroundEvent, close } = await installSnap(snapId);
      const response = await onBackgroundEvent({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'foo',
          },
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('getHomePage', () => {
    it('sends a OnHomePage request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onHomePage = async () => {
            return { content: { type: 'text', value: 'Hello, world!' } };
          };
         `,
      });

      const { onHomePage, close } = await installSnap(snapId);
      const response = await onHomePage();

      expect(response).toStrictEqual(
        expect.objectContaining({
          getInterface: expect.any(Function),
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('getSettingsPage', () => {
    it('sends a OnSettingsPage request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onSettingsPage = async () => {
            return { content: { type: 'text', value: 'Hello, world!' } };
          };
         `,
      });

      const { onSettingsPage, close } = await installSnap(snapId);
      const response = await onSettingsPage();

      expect(response).toStrictEqual(
        expect.objectContaining({
          getInterface: expect.any(Function),
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('onKeyringRequest', () => {
    it('sends a keyring request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onKeyringRequest = async ({ origin, request }) => {
            return request;
          }
         `,
      });

      const { onKeyringRequest, close } = await installSnap(snapId);
      const response = await onKeyringRequest({
        origin: 'metamask.io',
        params: {},
        method: 'keyring_listAccounts',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              params: {},
              id: 1,
              method: 'keyring_listAccounts',
              jsonrpc: '2.0',
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
  });

  describe('onInstall', () => {
    it('sends onInstall request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onInstall = async () => {
            return { content: { type: 'text', value: 'Hello, world!' } };
          };
         `,
      });

      const { onInstall, close } = await installSnap(snapId);
      const response = await onInstall();

      expect(response).toStrictEqual(
        expect.objectContaining({
          getInterface: expect.any(Function),
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('onUpdate', () => {
    it('sends onUpdate request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onUpdate = async () => {
            return { content: { type: 'text', value: 'Hello, world!' } };
          };
         `,
      });

      const { onUpdate, close } = await installSnap(snapId);
      const response = await onUpdate();

      expect(response).toStrictEqual(
        expect.objectContaining({
          getInterface: expect.any(Function),
        }),
      );

      await close();
      await closeServer();
    });
  });

  describe('mockJsonRpc', () => {
    it('mocks a JSON-RPC method', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await ethereum.request({
              method: 'foo',
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            'endowment:ethereum-provider': {},
          },
        }),
      });

      const { request, close, mockJsonRpc } = await installSnap(snapId);
      const { unmock } = mockJsonRpc({
        method: 'foo',
        result: 'mock',
      });

      const response = await request({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'mock',
          },
        }),
      );

      unmock();

      const unmockedResponse = await request({
        method: 'foo',
      });

      expect(unmockedResponse).toStrictEqual(
        expect.objectContaining({
          response: {
            error: expect.objectContaining({
              code: -32601,
              message: 'The method "foo" does not exist / is not available.',
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

    it('mocks a JSON-RPC implementation', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await ethereum.request({
              method: 'foo',
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            'endowment:ethereum-provider': {},
          },
        }),
      });

      const { request, close, mockJsonRpc } = await installSnap(snapId);
      const { unmock } = mockJsonRpc(({ method }) => {
        return `${method}_mocked`;
      });

      const response = await request({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'foo_mocked',
          },
        }),
      );

      unmock();

      const unmockedResponse = await request({
        method: 'foo',
      });

      expect(unmockedResponse).toStrictEqual(
        expect.objectContaining({
          response: {
            error: expect.objectContaining({
              code: -32601,
              message: 'The method "foo" does not exist / is not available.',
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
  });

  describe('mockJsonRpcOnce', () => {
    it('mocks a JSON-RPC method', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onRpcRequest = async () => {
            return await ethereum.request({
              method: 'foo',
            });
          };
        `,
        manifest: getSnapManifest({
          initialPermissions: {
            'endowment:ethereum-provider': {},
          },
        }),
      });

      const { request, close, mockJsonRpcOnce } = await installSnap(snapId);
      mockJsonRpcOnce({
        method: 'foo',
        result: 'mock',
      });

      const response = await request({
        method: 'foo',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: 'mock',
          },
        }),
      );

      const unmockedResponse = await request({
        method: 'foo',
      });

      expect(unmockedResponse).toStrictEqual(
        expect.objectContaining({
          response: {
            error: expect.objectContaining({
              code: -32601,
              message: 'The method "foo" does not exist / is not available.',
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
  });
});

describe('getStateFromAccount', () => {
  it('returns the state for the given account', () => {
    const account = getMockAccount({
      address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
    });

    expect(getStateFromAccount(account)).toStrictEqual({
      addresses: [`${account.scopes[0]}:${account.address}`],
      accountId: account.id,
    });
  });
});

describe('getStateFromAsset', () => {
  it('returns the state for the given asset', () => {
    const assetMetadata = {
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
        name: 'Solana',
        symbol: 'SOL',
      },
    };

    expect(
      getStateFromAsset(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        assetMetadata,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('throws an error if the asset is not found in the metadata', () => {
    const assetMetadata = {
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
        name: 'Solana',
        symbol: 'SOL',
      },
    };

    expect(() =>
      getStateFromAsset(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        assetMetadata,
      ),
    ).toThrow(
      'Asset with ID "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" not found in simulation assets.',
    );
  });
});

describe('getMockAccount', () => {
  it('returns a mock account for the given `address`', () => {
    expect(
      getMockAccount({
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
        "assets": [],
        "id": "6b86b273-ff344ce1-9d6b804e-ff5a3f57",
        "owned": false,
        "scopes": [
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        ],
        "selected": false,
      }
    `);
  });

  it('returns a mock account for the given `address` and `assets`', () => {
    expect(
      getMockAccount({
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        assets: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ],
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
        "assets": [
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501",
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        ],
        "id": "d4735e3a-265e46ee-a03f5971-8b9b5d03",
        "owned": false,
        "scopes": [
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        ],
        "selected": false,
      }
    `);
  });
});
