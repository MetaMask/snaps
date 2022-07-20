import {
  CommandMethodsMapping,
  getCommandMethodImplementations,
} from './commands';
import { HandlerType } from './enums';

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

  it('the executeSnap method will throw an Error if the snapName is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    await expect(async () => {
      await methodsObj.executeSnap(1 as any, 'code', [
        'endowment1',
        'endowment2',
      ]);
    }).rejects.toThrow('snapName is not a string');
  });

  it('the executeSnap method will throw an Error if the sourceCode is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    await expect(async () => {
      await methodsObj.executeSnap('foo', 2 as any, [
        'endowment1',
        'endowment2',
      ]);
    }).rejects.toThrow('sourceCode is not a string');
  });

  it('the executeSnap method will throw an Error if it is not passed a proper Endowments object', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    await expect(async () => {
      await methodsObj.executeSnap('foo', 'code', ['endowment1', 2 as any]);
    }).rejects.toThrow('endowment is not a proper Endowments object');
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
      HandlerType.onRpcRequest,
      'bar',
      rpcRequest as any,
    );
    expect(invokeSnapRpc).toHaveBeenCalledTimes(1);
    expect(invokeSnapRpc).toHaveBeenCalledWith(
      'foo',
      HandlerType.onRpcRequest,
      {
        origin: 'bar',
        request: rpcRequest,
      },
    );
  });

  it('the snapRpc method will throw an error if the target is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc(
        2 as any,
        HandlerType.onRpcRequest,
        'bar',
        rpcRequest as any,
      );
    }).rejects.toThrow('target is not a string');
  });

  it('the snapRpc method will throw an error if the origin is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc(
        'foo',
        HandlerType.onRpcRequest,
        2 as any,
        rpcRequest as any,
      );
    }).rejects.toThrow('origin is not a string');
  });

  it('the snapRpc method will throw an error if the request is not a JSON RPC request', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const onTerminate = jest.fn();
    const methodsObj = getCommandMethodImplementations(
      startSnap,
      invokeSnapRpc,
      onTerminate,
    );
    const rpcRequest = { method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc(
        'foo',
        HandlerType.onRpcRequest,
        'bar',
        rpcRequest as any,
      );
    }).rejects.toThrow('request is not a proper JSON RPC Request');
  });
});
