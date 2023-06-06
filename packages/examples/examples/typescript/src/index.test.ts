import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

jest.setTimeout(60000);

describe('onRpcRequest', () => {
  describe('hello', () => {
    it('sends a notification', async () => {
      const { request } = await installSnap('local:http://localhost:8086');
      const response = await request({
        method: 'hello',
        origin: 'foo',
      });

      expect(response).toSendNotification('Hello, foo!');
      expect(response).toRespondWith(null);
    });
  });

  it('throws an error for unknown request methods', async () => {
    const { request } = await installSnap('local:http://localhost:8086');
    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'Method not found.',
          stack: expect.any(String),
        },
      },
    });
  });
});
