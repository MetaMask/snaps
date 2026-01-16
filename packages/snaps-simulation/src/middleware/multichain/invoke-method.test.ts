import { invokeMethodHandler } from './invoke-method';
import { MOCK_CAVEAT } from './test-utils';

describe('invokeMethodHandler', () => {
  it('remaps the original request', async () => {
    const getCaveat = jest.fn().mockReturnValue(MOCK_CAVEAT);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_invokeMethod',
      params: {
        scope: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [],
        },
      },
    };

    await invokeMethodHandler(request, { getCaveat });

    expect(request).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      method: 'personal_sign',
      params: [],
      scope: 'eip155:1',
    });
  });

  it('throws if an unsupported method is requested', async () => {
    const getCaveat = jest.fn().mockReturnValue(MOCK_CAVEAT);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_invokeMethod',
      params: {
        scope: 'eip155:1',
        request: {
          method: 'signMessage',
          params: [],
        },
      },
    };

    await expect(invokeMethodHandler(request, { getCaveat })).rejects.toThrow(
      'The requested account and/or method has not been authorized by the user.',
    );
  });

  it('throws if no caveat is returned', async () => {
    const getCaveat = jest.fn();

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_invokeMethod',
      params: {
        scope: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [],
        },
      },
    };

    await expect(invokeMethodHandler(request, { getCaveat })).rejects.toThrow(
      'The requested account and/or method has not been authorized by the user.',
    );
  });

  it('throws if invalid params are passed', async () => {
    await expect(
      invokeMethodHandler(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'wallet_invokeMethod',
          params: [],
        },
        { getCaveat: jest.fn() },
      ),
    ).rejects.toThrow('Invalid method parameter(s).');
  });
});
