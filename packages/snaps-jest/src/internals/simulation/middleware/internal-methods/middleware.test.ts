import { createInternalMethodsMiddleware } from './middleware';

describe('createInternalMethodsMiddleware', () => {
  it('returns a middleware function', () => {
    expect(
      createInternalMethodsMiddleware({
        getMnemonic: async () => {
          return new Uint8Array();
        },
      }),
    ).toBeInstanceOf(Function);
  });

  it('calls the next middleware if the method is not handled internally', async () => {
    const next = jest.fn();
    const end = jest.fn();
    const middleware = createInternalMethodsMiddleware({
      getMnemonic: async () => {
        return new Uint8Array();
      },
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await middleware(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendTransaction',
        params: [],
      },
      {
        jsonrpc: '2.0',
        id: 1,
      },
      next,
      end,
    );

    expect(next).toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();
  });

  it('does not call the next middleware if the method is handled internally', async () => {
    const next = jest.fn();
    const end = jest.fn();
    const middleware = createInternalMethodsMiddleware({
      getMnemonic: async () => {
        return new Uint8Array();
      },
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await middleware(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_accounts',
        params: [],
      },
      {
        jsonrpc: '2.0',
        id: 1,
      },
      next,
      end,
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('logs and ends the request if the handler throws an error', async () => {
    const next = jest.fn();
    const end = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    const middleware = createInternalMethodsMiddleware({
      getMnemonic: async () => {
        throw new Error('Test');
      },
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await middleware(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_accounts',
        params: [],
      },
      {
        jsonrpc: '2.0',
        id: 1,
      },
      next,
      end,
    );

    expect(next).not.toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });
});
