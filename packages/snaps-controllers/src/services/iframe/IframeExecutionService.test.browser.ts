import type { ErrorMessageEvent } from '@metamask/snaps-controllers';
import type { HandlerType } from '@metamask/snaps-utils';
import { browser } from '@wdio/globals';
import { describe, it } from 'mocha';
import type { Duplex } from 'stream';

describe('IframeExecutionService', () => {
  it('executes a snap', async () => {
    // `wdio` opens a static server on port 4567.
    await browser.navigateTo('http://localhost:4567/service');

    // This runs some code in the browser context, similar to how you would run
    // this code in the console of a browser. Unfortunately this means that we
    // don't have access to any non-browser globals, so this test is a little
    // verbose.
    const result = await browser.executeAsync(
      async (done: (result?: unknown) => void) => {
        const MOCK_SNAP_ID = 'foo';
        const MOCK_BLOCK_NUMBER = '0xa70e75';

        const controllerMessenger = new window.ControllerMessenger<
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

        /**
         * Function to set up the snap provider.
         *
         * @param _snapId - The ID of the snap.
         * @param rpcStream - The stream to use for the provider.
         */
        function setupSnapProvider(_snapId: string, rpcStream: Duplex) {
          const mux = window.setupMultiplex(rpcStream, 'foo');
          const stream = mux.createStream('metamask-provider');
          const engine = new window.JsonRpcEngine();

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

          const providerStream = window.createEngineStream({ engine });
          window.pump(stream, providerStream, stream);
        }

        const service = new window.IframeExecutionService({
          messenger,
          iframeUrl: new URL('http://localhost:4567/iframe'),
          setupSnapProvider,
        });

        await service.executeSnap({
          snapId: MOCK_SNAP_ID,
          sourceCode: `
          module.exports.onRpcRequest = () => {
            return { foo: 'bar' };
          };
        `,
          endowments: [],
        });

        const response = await service.handleRpcRequest(MOCK_SNAP_ID, {
          origin: 'foo',
          handler: 'onRpcRequest' as HandlerType,
          request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'bar',
          },
        });

        await service.terminateAllSnaps();
        done(response);
      },
    );

    expect(result).toStrictEqual({ foo: 'bar' });
  });
});
