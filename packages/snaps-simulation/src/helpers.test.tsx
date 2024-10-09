import { DialogType } from '@metamask/snaps-sdk';
import { Text } from '@metamask/snaps-sdk/jsx';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';

import { installSnap } from './simulation';
import { getMockServer } from './test-utils';
import {
  assertIsAlertDialog,
  assertIsConfirmationDialog,
  assertIsPromptDialog,
} from './validation';

describe('helpers', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'snapsEnvironment', {
      writable: true,
      value: {
        installSnap,
      },
    });
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
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
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
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
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
        typeInField: expect.any(Function),
        selectInDropdown: expect.any(Function),
        selectFromRadioGroup: expect.any(Function),
        selectFromSelector: expect.any(Function),
        uploadFile: expect.any(Function),
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

  describe('onKeyringRequest', () => {
    it('sends a keyring request and returns the result', async () => {
      jest.spyOn(console, 'log').mockImplementation();

      const { snapId, close: closeServer } = await getMockServer({
        sourceCode: `
          module.exports.onKeyringRequest = async ({ origin, request }) => {
            return { success: true };
          }
         `,
      });

      const { onKeyringRequest, close } = await installSnap(snapId);
      const response = await onKeyringRequest({
        origin: 'metamask.io',
        params: {
          foo: 'bar',
        },
        method: 'keyring_createAccount',
      });

      expect(response).toStrictEqual(
        expect.objectContaining({
          response: {
            result: {
              success: true,
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
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
  });
});
