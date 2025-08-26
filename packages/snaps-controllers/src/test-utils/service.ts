import { Messenger } from '@metamask/base-controller/next';
import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { createEngineStream } from '@metamask/json-rpc-middleware-stream';
import { logError } from '@metamask/snaps-utils';
import { pipeline } from 'readable-stream';
import type { Duplex } from 'readable-stream';

import { MOCK_BLOCK_NUMBER } from './constants';
import type { ErrorMessageEvent } from '../services';
import { setupMultiplex } from '../services';

export const createService = <
  Service extends new (...args: any[]) => InstanceType<Service>,
>(
  ServiceClass: Service,
  options?: Omit<
    ConstructorParameters<Service>[0],
    'messenger' | 'setupSnapProvider'
  >,
) => {
  const messenger = new Messenger<never, ErrorMessageEvent>();

  const restrictedMessenger = messenger.getRestricted<
    'ExecutionService',
    never,
    ErrorMessageEvent['type']
  >({
    name: 'ExecutionService',
  });

  const service = new ServiceClass({
    messenger: restrictedMessenger,
    setupSnapProvider: (_snapId: string, rpcStream: Duplex) => {
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
    },
    ...options,
  });

  return {
    service,
    messenger: restrictedMessenger,
  };
};
