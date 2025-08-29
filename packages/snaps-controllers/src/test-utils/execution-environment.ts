import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { createEngineStream } from '@metamask/json-rpc-middleware-stream';
import { Messenger } from '@metamask/messenger';
import { logError, type SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';
import { pipeline } from 'readable-stream';

import { MOCK_BLOCK_NUMBER } from './constants';
import type {
  ExecutionService,
  ExecutionServiceActions,
  ExecutionServiceEvents,
  SetupSnapProvider,
  SnapExecutionData,
} from '../services';
import { NodeThreadExecutionService, setupMultiplex } from '../services/node';

export const getNodeEESMessenger = (
  messenger: MockControllerMessenger<
    ExecutionServiceActions,
    ExecutionServiceEvents
  >,
) => {
  const executionServiceMessenger = new Messenger<
    'ExecutionService',
    ExecutionServiceActions,
    ExecutionServiceEvents,
    any
  >({ namespace: 'ExecutionService', parent: messenger });

  messenger.unregisterActionHandler('ExecutionService:handleRpcRequest');
  messenger.unregisterActionHandler('ExecutionService:executeSnap');
  messenger.unregisterActionHandler('ExecutionService:terminateSnap');
  messenger.unregisterActionHandler('ExecutionService:terminateAllSnaps');

  return executionServiceMessenger;
};

export const getNodeEES = (
  messenger: ReturnType<typeof getNodeEESMessenger>,
  setupSnapProvider?: SetupSnapProvider,
) =>
  new NodeThreadExecutionService({
    messenger,
    setupSnapProvider:
      setupSnapProvider ??
      jest.fn().mockImplementation((_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        engine.push((req, res, next, end) => {
          if (req.method === 'eth_blockNumber') {
            res.result = MOCK_BLOCK_NUMBER;
            return end();
          }
          return next();
        });
        const providerStream = createEngineStream({ engine });
        pipeline(stream, providerStream, stream, (error) => {
          if (error && !error.message?.match('Premature close')) {
            logError(`Provider stream failure.`, error);
          }
        });
      }),
  });

export class ExecutionEnvironmentStub implements ExecutionService {
  constructor(messenger: ReturnType<typeof getNodeEESMessenger>) {
    messenger.registerActionHandler(
      `ExecutionService:handleRpcRequest`,
      async (snapId: string, options: SnapRpcHookArgs) =>
        this.handleRpcRequest(snapId, options),
    );

    messenger.registerActionHandler(
      'ExecutionService:executeSnap',
      async (snapData: SnapExecutionData) => this.executeSnap(snapData),
    );

    messenger.registerActionHandler(
      'ExecutionService:terminateSnap',
      async (snapId: string) => this.terminateSnap(snapId),
    );

    messenger.registerActionHandler(
      'ExecutionService:terminateAllSnaps',
      async () => this.terminateAllSnaps(),
    );
  }

  async handleRpcRequest(
    snapId: string,
    options: SnapRpcHookArgs,
  ): Promise<unknown> {
    const handler = this.getRpcRequestHandler(snapId);
    return await handler(options);
  }

  async terminateAllSnaps() {
    // empty stub
  }

  getRpcRequestHandler(_snapId: string) {
    return async ({ request }: SnapRpcHookArgs) => {
      return new Promise((resolve) => {
        const results = `${String(request.method)}${String(request.id)}`;
        resolve(results);
      });
    };
  }

  async executeSnap(_snapData: SnapExecutionData) {
    return Promise.resolve('some-unique-id');
  }

  async terminateSnap(_snapId: string) {
    // empty stub
  }
}
