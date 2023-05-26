import {
  getNotifications,
  installSnap,
  sendJsonRpcRequest,
} from '@metamask/snaps-jest-environment';

jest.setTimeout(60000);

describe('onRpcRequest', () => {
  beforeAll(async () => {
    await installSnap('http://localhost:8086');
  });

  describe('hello', () => {
    it('sends a notification', async () => {
      expect(
        await sendJsonRpcRequest({
          method: 'hello',
          origin: 'foo',
        }),
      ).toStrictEqual({
        result: null,
      });

      expect(await getNotifications()).toStrictEqual(['Hello, foo!']);
    });
  });

  it('throws an error for unknown request methods', async () => {
    expect(
      await sendJsonRpcRequest({
        method: 'foo',
      }),
    ).toStrictEqual({
      error: {
        code: -32603,
        message: 'Internal JSON-RPC error.',
        data: {
          cause: {
            message: 'Method not found.',
            stack: expect.any(String),
          },
        },
      },
    });
  });
});
