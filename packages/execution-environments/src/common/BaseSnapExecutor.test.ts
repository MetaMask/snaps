import { PassThrough } from 'stream';
import * as ethErrors from 'eth-rpc-errors';
import { BaseSnapExecutor } from './BaseSnapExecutor';

class ExecutorMock extends BaseSnapExecutor {
  static initialize() {
    const commandStream = new PassThrough({ objectMode: true });
    const rpcStream = new PassThrough({ objectMode: true });
    return {
      commandStream,
      rpcStream,
      executor: new ExecutorMock(commandStream, rpcStream),
    };
  }

  beginSnap(snapName: string, sourceCode: string, endowments: string[]) {
    this.startSnap(snapName, sourceCode, endowments);
  }
}

const sourceCode = `wallet.registerRpcMessageHandler(async (origin, request) => {
    switch(request.method) {
        case 'hallo':
            return 'goededag!';
        default:
            return 'doei';
    }
})`;

const snapName = 'npm:fooSnap';

const endowments = ['setTimeout', 'clearTimeout'];

describe('BaseSnapExecutor', () => {
  it('should be able to create an executor', () => {
    const { executor } = ExecutorMock.initialize();
    expect(executor).toBeDefined();
  });

  it('should be able to start a snap', () => {
    const { executor } = ExecutorMock.initialize();
    expect(() =>
      executor.beginSnap(snapName, sourceCode, endowments),
    ).not.toThrow();
  });

  it('should be able to clean up previously set error handlers', () => {
    const { executor } = ExecutorMock.initialize();
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    executor.beginSnap(snapName, sourceCode, endowments);
    executor.beginSnap('npm:barSnap', sourceCode, endowments);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when evaluating bad code', () => {
    const badSourceCode = `wallet.registerRpcMessageHandler(async (origin, request) => {
        swch(request.method) {
            case 'hallo':
                return 'goededag!';
            default:
                return 'doei';
        }
        })`;
    const { executor } = ExecutorMock.initialize();
    expect(() =>
      executor.beginSnap(snapName, badSourceCode, endowments),
    ).toThrow("Error while running snap 'npm:fooSnap': Unexpected token '{'");
  });

  it('should be able to notify of promise errors in the execution environment', () => {
    const { executor } = ExecutorMock.initialize();
    const serializeErrorSpy = jest.spyOn(ethErrors, 'serializeError');
    executor.beginSnap(snapName, sourceCode, endowments);
    window.dispatchEvent(new Event('unhandledrejection'));
    expect(serializeErrorSpy).toHaveBeenCalledWith(
      new Error('Unhandled promise rejection in snap.'),
      {
        shouldIncludeStack: false,
      },
    );
  });

  it('should be able to notify of normal errors in the execution environment', () => {
    const { executor } = ExecutorMock.initialize();
    const serializeErrorSpy = jest.spyOn(ethErrors, 'serializeError');
    executor.beginSnap(snapName, sourceCode, endowments);
    window.dispatchEvent(new Event('error'));
    expect(serializeErrorSpy).toHaveBeenCalledWith(
      new Error('Uncaught error in snap.'),
      {
        shouldIncludeStack: false,
      },
    );
  });

  it('should be able to handle a valid incoming JSON RPC request', () => {
    const { commandStream, executor } = ExecutorMock.initialize();
    executor.beginSnap(snapName, sourceCode, endowments);
    const respondSpy = jest.spyOn(executor as any, 'respond');
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'snapRpc',
      params: [
        snapName,
        'http://localhost:8080',
        { jsonrpc: '2.0', id: 1, method: 'hallo' },
      ],
    };
    commandStream.push(request);
    expect(respondSpy).toHaveBeenCalledWith(1, { result: 'goededag!' });
  });
});
