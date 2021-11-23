import { JsonRpcEngine } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { requestPermissionsHandler } from './requestPermissions';

describe('requestPermissions RPC method', () => {
  it('returns the values of the object returned by requestPermissionsForOrigin', async () => {
    const { implementation } = requestPermissionsHandler;
    const mockRequestPermissionsForOrigin = jest
      .fn()
      .mockImplementationOnce(() => {
        return [{ a: 'a', b: 'b', c: 'c' }];
      });

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) =>
      implementation(req as any, res as any, next, end, {
        requestPermissionsForOrigin: mockRequestPermissionsForOrigin,
      }),
    );

    const response: any = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'arbitraryName',
      params: [{}],
    });

    expect(response.result).toStrictEqual(['a', 'b', 'c']);
    expect(mockRequestPermissionsForOrigin).toHaveBeenCalledTimes(1);
    expect(mockRequestPermissionsForOrigin).toHaveBeenCalledWith({}, '1');
  });

  it('returns an error if the request has an invalid id', async () => {
    const { implementation } = requestPermissionsHandler;
    const mockRequestPermissionsForOrigin = jest.fn();

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) =>
      implementation(req as any, res as any, next, end, {
        requestPermissionsForOrigin: mockRequestPermissionsForOrigin,
      }),
    );

    for (const invalidId of ['', null, {}]) {
      const req = {
        jsonrpc: '2.0',
        id: invalidId,
        method: 'arbitraryName',
        params: [], // doesn't matter
      };

      const expectedError = ethErrors.rpc
        .invalidRequest({
          message: 'Invalid request: Must specify a valid id.',
          data: { request: { ...req } },
        })
        .serialize();
      delete expectedError.stack;

      const response: any = await engine.handle(req as any);
      expect(response.error).toStrictEqual(expectedError);
      expect(mockRequestPermissionsForOrigin).not.toHaveBeenCalled();
    }
  });

  it('returns an error if the request params are invalid', async () => {
    const { implementation } = requestPermissionsHandler;
    const mockRequestPermissionsForOrigin = jest.fn();

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) =>
      implementation(req as any, res as any, next, end, {
        requestPermissionsForOrigin: mockRequestPermissionsForOrigin,
      }),
    );

    for (const invalidParams of ['foo', ['bar']]) {
      const req = {
        jsonrpc: '2.0',
        id: 1,
        method: 'arbitraryName',
        params: invalidParams,
      };

      const expectedError = ethErrors.rpc
        .invalidParams({
          data: { request: { ...req } },
        })
        .serialize();
      delete expectedError.stack;

      const response: any = await engine.handle(req as any);
      expect(response.error).toStrictEqual(expectedError);
      expect(mockRequestPermissionsForOrigin).not.toHaveBeenCalled();
    }
  });
});
