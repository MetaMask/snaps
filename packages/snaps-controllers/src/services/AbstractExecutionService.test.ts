import { HandlerType } from '@metamask/snaps-utils';

import { createService } from '../test-utils';
import type { ExecutionServiceArgs } from './AbstractExecutionService';
import { NodeThreadExecutionService } from './node';

class MockExecutionService extends NodeThreadExecutionService {
  constructor({ messenger, setupSnapProvider }: ExecutionServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });
  }

  getJobs() {
    return this.jobs;
  }
}

describe('AbstractExecutionService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs error for unrecognized notifications', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { service } = createService(MockExecutionService);

    await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });

    const { streams } = service.getJobs().values().next().value;
    streams.command.emit('data', {
      jsonrpc: '2.0',
      method: 'foo',
    });

    await service.terminateAllSnaps();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      new Error(`Received unexpected command stream notification "foo".`),
    );
  });

  it('logs error for malformed UnhandledError notification', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { service } = createService(MockExecutionService);

    await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });

    const { streams } = service.getJobs().values().next().value;
    streams.command.emit('data', {
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: [2],
    });

    streams.command.emit('data', {
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: { error: null },
    });

    await service.terminateAllSnaps();

    const expectedError = new Error(
      `Received malformed "UnhandledError" command stream notification.`,
    );
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, expectedError);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, expectedError);
  });

  it('throws an error if RPC request handler is unavailable', async () => {
    const { service } = createService(MockExecutionService);
    const snapId = 'TestSnap';
    await expect(
      service.handleRpcRequest(snapId, {
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          id: 6,
          method: 'bar',
        },
      }),
    ).rejects.toThrow(
      `Snap execution service returned no RPC handler for running snap "${snapId}".`,
    );
  });
});
