import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';

import type {
  ExecutionService,
  ExecutionServiceActions,
  ExecutionServiceEvents,
  SnapExecutionData,
} from '../services';
import { NodeThreadExecutionService, setupMultiplex } from '../services';

export const MOCK_BLOCK_NUMBER = '0xa70e75';

export const getNodeEESMessenger = (
  messenger: MockControllerMessenger<
    ExecutionServiceActions,
    ExecutionServiceEvents
  >,
) =>
  messenger.getRestricted({
    name: 'ExecutionService',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:outboundRequest',
      'ExecutionService:outboundResponse',
    ],
    allowedActions: [
      'ExecutionService:executeSnap',
      'ExecutionService:handleRpcRequest',
      'ExecutionService:terminateAllSnaps',
      'ExecutionService:terminateSnap',
    ],
  });

export const getNodeEES = (messenger: ReturnType<typeof getNodeEESMessenger>) =>
  new NodeThreadExecutionService({
    messenger,
    setupSnapProvider: jest.fn().mockImplementation((_snapId, rpcStream) => {
      const mux = setupMultiplex(rpcStream, 'foo');
      const stream = mux.createStream('metamask-provider');
      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        if (req.method === 'metamask_getProviderState') {
          res.result = {
            isUnlocked: false,
            accounts: [],
            chainId: '0x1',
            networkVersion: '1',
          };
          return end();
        } else if (req.method === 'eth_blockNumber') {
          res.result = MOCK_BLOCK_NUMBER;
          return end();
        }
        return next();
      });
      const providerStream = createEngineStream({ engine });
      pump(stream, providerStream, stream);
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
        const results = `${request.method}${request.id}`;
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
