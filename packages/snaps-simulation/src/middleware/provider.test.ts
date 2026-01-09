import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { JsonRpcRequest } from '@metamask/utils';
import { stringToBytes } from '@metamask/utils';
import { FetchRequest } from 'ethers';

import { createProviderMiddleware } from './provider';
import { createStore, setChain } from '../store';
import { getMockOptions } from '../test-utils';

/**
 * Sets up the JSON-RPC engine, middleware and Redux store for testing.
 *
 * @returns The store and the JSON-RPC engine.
 */
function createMiddleware() {
  const { store } = createStore(getMockOptions());
  const middleware = createProviderMiddleware(store);
  const engine = new JsonRpcEngine();
  engine.push(middleware);
  return { engine, store };
}

describe('createProviderMiddleware', () => {
  const fetchMock = jest.fn();
  FetchRequest.registerGetUrl(async (request) => {
    const { statusCode, result, statusMessage, headers } = await fetchMock(
      request.url,
    );
    const body = stringToBytes(JSON.stringify(result));
    return {
      statusCode,
      body,
      statusMessage: statusMessage ?? '',
      headers: headers ?? {},
    };
  });

  const request = {
    jsonrpc: '2.0' as const,
    id: 1,
    method: 'net_version',
    params: [],
  };

  it('responds to RPC requests', async () => {
    fetchMock.mockResolvedValue({
      statusCode: 200,
      result: { id: 1, jsonrpc: '2.0', result: '1' },
    });

    const { engine } = createMiddleware();

    const result = await engine.handle(request);
    expect(result).toStrictEqual({ id: 1, jsonrpc: '2.0', result: '1' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://mainnet.infura.io'),
    );
  });

  it('routes RPC requests to proper chain ID', async () => {
    fetchMock.mockResolvedValue({
      statusCode: 200,
      result: { id: 1, jsonrpc: '2.0', result: '11155111' },
    });

    const { store, engine } = createMiddleware();

    store.dispatch(setChain('0xaa36a7'));

    const result = await engine.handle(request);
    expect(result).toStrictEqual({ id: 1, jsonrpc: '2.0', result: '11155111' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://sepolia.infura.io'),
    );
  });

  it('uses the chain ID from the request if specified', async () => {
    fetchMock.mockResolvedValue({
      statusCode: 200,
      result: { id: 1, jsonrpc: '2.0', result: '11155111' },
    });

    const { engine } = createMiddleware();

    const result = await engine.handle({
      ...request,
      scope: 'eip155:11155111',
    } as unknown as JsonRpcRequest);
    expect(result).toStrictEqual({ id: 1, jsonrpc: '2.0', result: '11155111' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://sepolia.infura.io'),
    );
  });

  it('handles errors nested in the info property', async () => {
    fetchMock.mockResolvedValue({
      statusCode: 200,
      result: {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'The method abc does not exist/is not available',
        },
      },
    });

    const { engine } = createMiddleware();

    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'abc',
      params: [],
    });
    expect(result).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: 'The method abc does not exist/is not available',
      },
    });
  });

  it('handles errors nested in the error property', async () => {
    fetchMock.mockResolvedValue({
      statusCode: 200,
      result: {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'missing value for required argument 0',
        },
      },
    });

    const { engine } = createMiddleware();

    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
    });
    expect(result).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'missing value for required argument 0',
      },
    });
  });

  it('falls back to internal RPC error', async () => {
    fetchMock.mockRejectedValue(new Error('Unknown error'));

    const { engine } = createMiddleware();

    const result = await engine.handle(request);
    expect(result).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: expect.objectContaining({
        code: -32603,
        message: 'Internal JSON-RPC error.',
      }),
    });
  });

  it('ignores non-EVM requests', async () => {
    const { engine } = createMiddleware();

    const result = await engine.handle({
      ...request,
      scope: 'solana:foo',
    } as unknown as JsonRpcRequest);
    expect(result).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: expect.objectContaining({
        code: -32603,
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request:',
        ),
      }),
    });
  });
});
