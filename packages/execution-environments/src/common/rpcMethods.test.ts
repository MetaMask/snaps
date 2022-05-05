import { rpcMethods, RpcMethodsMapping } from './rpcMethods';

describe('rpcMethods', () => {
  it('will return an object with ping, executeSnap and snapRpc methods', () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    ['ping', 'executeSnap', 'snapRpc'].forEach((method) => {
      expect(
        typeof methodsObj[method as keyof RpcMethodsMapping],
      ).toStrictEqual('function');
    });
    expect(Object.keys(methodsObj)).toHaveLength(3);
  });

  it("the ping method will return 'OK'", async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    expect(await methodsObj.ping()).toStrictEqual('OK');
  });

  it("the executeSnap method will return 'OK'", async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    expect(
      await methodsObj.executeSnap('foo', 'code', ['endowment1', 'endowment2']),
    ).toStrictEqual('OK');
  });

  it('the executeSnap method will throw an Error if the snapName is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
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
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
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
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    await expect(async () => {
      await methodsObj.executeSnap('foo', 'code', ['endowment1', 2 as any]);
    }).rejects.toThrow('endowment is not a proper Endowments object');
  });

  it('the snapRpc method will invoke the invokeSnapRpc function', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await methodsObj.snapRpc('foo', 'bar', rpcRequest as any);
    expect(invokeSnapRpc).toHaveBeenCalledTimes(1);
  });

  it('the snapRpc method will throw an error if the target is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc(2 as any, 'bar', rpcRequest as any);
    }).rejects.toThrow('target is not a string');
  });

  it('the snapRpc method will throw an error if the origin is not a string', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    const rpcRequest = { jsonrpc: '2.0', method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc('foo', 2 as any, rpcRequest as any);
    }).rejects.toThrow('origin is not a string');
  });

  it('the snapRpc method will throw an error if the request is not a JSON RPC request', async () => {
    const startSnap = jest.fn();
    const invokeSnapRpc = jest.fn();
    const methodsObj = rpcMethods(startSnap, invokeSnapRpc);
    const rpcRequest = { method: 'hello' };
    await expect(async () => {
      await methodsObj.snapRpc('foo', 'bar', rpcRequest as any);
    }).rejects.toThrow('request is not a proper JSON RPC Request');
  });
});
