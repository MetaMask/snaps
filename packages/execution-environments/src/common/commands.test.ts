import { HandlerType } from '@metamask/snap-utils';
import {
  CommandMethodsMapping,
  getCommandMethodImplementations,
} from './commands';

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
      expect(
        typeof methodsObj[method as keyof CommandMethodsMapping],
      ).toStrictEqual('function');
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
    expect(await methodsObj.ping()).toStrictEqual('OK');
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
    expect(await methodsObj.terminate()).toStrictEqual('OK');
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
    ).toStrictEqual('OK');
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
