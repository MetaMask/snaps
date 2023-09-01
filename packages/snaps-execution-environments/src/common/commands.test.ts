import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

import type { CommandMethodsMapping } from './commands';
import {
  getCommandMethodImplementations,
  getHandlerArguments,
} from './commands';

describe('getHandlerArguments', () => {
  it('validates the request params for the OnTransaction handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, HandlerType.OnTransaction, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('throws for invalid handler types', () => {
    expect(() =>
      // @ts-expect-error Invalid handler type.
      getHandlerArguments(MOCK_ORIGIN, 'foo', {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid branch reached. Should be detected during compilation.');
  });
});

describe('getCommandMethodImplementations', () => {
  it('will return an object with ping, executeSnap, snapRpc and terminate methods', () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    ['ping', 'executeSnap', 'snapRpc', 'terminate'].forEach((method) => {
      expect(typeof methodsObj[method as keyof CommandMethodsMapping]).toBe(
        'function',
      );
    });
    expect(Object.keys(methodsObj)).toHaveLength(4);
  });

  it("the ping method will return 'OK'", async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    expect(await methodsObj.ping()).toBe('OK');
  });

  it("the terminate method will 'OK'", async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    expect(await methodsObj.terminate()).toBe('OK');
  });

  it("the executeSnap method will return 'OK'", async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    expect(
      await methodsObj.executeSnap('foo', 'code', ['endowment1', 'endowment2']),
    ).toBe('OK');
  });

  it('the snapRpc method will invoke the invokeSnapRpc function', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await methodsObj.snapRpc(
      'foo',
      HandlerType.OnRpcRequest,
      'bar',
      rpcRequest as any,
    );
    expect(invokeSnapRpc).toHaveBeenCalledTimes(1);
    expect(invokeSnapRpc).toHaveBeenCalledWith(
      'foo',
      HandlerType.OnRpcRequest,
      {
        origin: 'bar',
        request: rpcRequest,
      },
    );
  });
});
