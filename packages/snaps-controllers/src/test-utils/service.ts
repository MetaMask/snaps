import { ControllerMessenger } from '@metamask/base-controller';
import { logError } from '@metamask/snaps-utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import { pipeline } from 'stream';
import type { Duplex } from 'stream';

import type { ErrorMessageEvent } from '../services';
import { setupMultiplex } from '../services';
import { MOCK_BLOCK_NUMBER } from './execution-environment';

export const createService = <
  Service extends new (...args: any[]) => InstanceType<Service>,
>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServiceClass: Service,
  options?: Omit<
    ConstructorParameters<Service>[0],
    'messenger' | 'setupSnapProvider'
  >,
) => {
  const controllerMessenger = new ControllerMessenger<
    never,
    ErrorMessageEvent
  >();

  const messenger = controllerMessenger.getRestricted<
    'ExecutionService',
    never,
    ErrorMessageEvent['type']
  >({
    name: 'ExecutionService',
  });

  const service = new ServiceClass({
    messenger,
    setupSnapProvider: (_snapId: string, rpcStream: Duplex) => {
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
        }

        if (req.method === 'eth_blockNumber') {
          res.result = MOCK_BLOCK_NUMBER;
          return end();
        }

        return next();
      });
      const providerStream = createEngineStream({ engine });
      pipeline(stream, providerStream, stream, (error) => {
        if (error) {
          logError(`Provider stream failure.`, error);
        }
      });
    },
    ...options,
  });

  return { service, messenger, controllerMessenger };
};
