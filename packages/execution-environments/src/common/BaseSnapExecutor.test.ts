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
    const serializeErrorSpy = jest.spyOn(ethErrors, 'serializeError');
    executor.beginSnap(snapName, sourceCode, endowments);
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
    commandStream.write(request);
    expect(serializeErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw an error if a snapRpc method request is made for a snap that has not been started', () => {
    const { commandStream } = ExecutorMock.initialize();
    const globalErrorSpy = jest.spyOn(global, 'Error');
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
    commandStream.write(request);
    expect(globalErrorSpy).toHaveBeenCalledWith(
      'No RPC handler registered for snap "npm:fooSnap"',
    );
  });

  it('should throw an error if a JSON RPC request is sent without an id', () => {
    const { commandStream, executor } = ExecutorMock.initialize();
    const globalErrorSpy = jest.spyOn(global, 'Error');
    executor.beginSnap(snapName, sourceCode, endowments);
    const request = {
      jsonrpc: '2.0',
      method: 'snapRpc',
      params: [
        snapName,
        'http://localhost:8080',
        { jsonrpc: '2.0', id: 1, method: 'hallo' },
      ],
    };
    commandStream.write(request);
    expect(globalErrorSpy).toHaveBeenCalledWith('Notifications not supported');
  });

  it('should return an Open RPC document if the requested method is "rpc.discover"', () => {
    const { commandStream, executor } = ExecutorMock.initialize();
    const globalErrorSpy = jest.spyOn(global, 'Error');
    const serializeErrorSpy = jest.spyOn(ethErrors, 'serializeError');
    const methodNotFoundSpy = jest.spyOn(
      ethErrors.ethErrors.rpc,
      'methodNotFound',
    );
    executor.beginSnap(snapName, sourceCode, endowments);
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'rpc.discover',
    };
    commandStream.write(request);
    expect(globalErrorSpy).not.toHaveBeenCalledWith();
    expect(serializeErrorSpy).not.toHaveBeenCalledWith();
    expect(methodNotFoundSpy).not.toHaveBeenCalled();
  });

  it('should notfiy with an error JSON RPC response if a method is not found', () => {
    const { commandStream, executor } = ExecutorMock.initialize();
    const methodNotFoundSpy = jest.spyOn(
      ethErrors.ethErrors.rpc,
      'methodNotFound',
    );
    executor.beginSnap(snapName, sourceCode, endowments);
    const request = {
      id: 1,
      jsonrpc: '2.0',
      method: 'getCats',
    };
    commandStream.write(request);
    expect(methodNotFoundSpy).toHaveBeenCalled();
  });

  it('should call teardown function when a JSON RPC request with the method terminate is called', () => {
    const { commandStream, executor } = ExecutorMock.initialize();
    executor.beginSnap(snapName, sourceCode, endowments);
    // need to disable dot-notation because typescript
    // will complain about methods being private otherwise
    // eslint-disable-next-line dot-notation
    const terminateSpy = jest.spyOn(executor['methods'] as any, 'terminate');
    const request = {
      id: 1,
      jsonrpc: '2.0',
      method: 'terminate',
    };
    commandStream.write(request);
    expect(terminateSpy).toHaveBeenCalled();
  });

  it('should thrown an error if a snap is attempted to be started twice', () => {
    const { executor } = ExecutorMock.initialize();
    executor.beginSnap(snapName, sourceCode, endowments);
    expect(() => executor.beginSnap(snapName, sourceCode, endowments)).toThrow(
      `Error while running snap 'npm:fooSnap': RPC handler already registered.`,
    );
  });
});
