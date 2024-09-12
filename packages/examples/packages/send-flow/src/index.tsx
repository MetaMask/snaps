import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import { SendFlow } from './components';

const accounts = [
  {
    name: 'My Bitcoin Account',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: 1.8,
    fiatBalance: 92000,
  },
  {
    name: 'Savings Account',
    address: 'bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3',
    balance: 2.5,
    fiatBalance: 150000,
  },
];

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `display`: Display a dialog with a counter, and a button to increment the
 * counter. This demonstrates how to display a dialog with JSX content, and how
 * to handle user input events.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'display': {
      const interfaceId = await snap.request({
        method: 'snap_createInterface',
        params: {
          ui: (
            <SendFlow
              accounts={accounts}
              selectedAccount={accounts[0].address}
              selectedCurrency="BTC"
              total={{ amount: 0, fiat: 0 }}
            />
          ),
          context: {
            accounts,
          },
        },
      });

      return await snap.request({
        method: 'snap_dialog',
        params: {
          id: interfaceId,
        },
      });
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

// /**
//  * Handle incoming user events coming from the Snap interface. This handler
//  * handles one event:
//  *
//  * - `increment`: Increment the counter and update the Snap interface with the
//  * new count. It is triggered when the user clicks the increment button.
//  *
//  * @param params - The event parameters.
//  * @param params.id - The Snap interface ID where the event was fired.
//  * @param params.event - The event object containing the event type, name and
//  * value.
//  * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
//  */
// export const onUserInput: OnUserInputHandler = async ({ event, id }) => {};
