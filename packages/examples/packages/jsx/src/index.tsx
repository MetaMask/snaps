import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType, DialogType } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import { Counter } from './components';
import { getCurrent, increment } from './utils';

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
      const count = await getCurrent();

      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: <Counter count={count} />,
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

/**
 * Handle incoming user events coming from the Snap interface. This handler
 * handles one event:
 *
 * - `increment`: Increment the counter and update the Snap interface with the
 * new count. It is triggered when the user clicks the increment button.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and
 * value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ event, id }) => {
  // Since this Snap only has one event, we can assert the event type and name
  // directly.
  assert(event.type === UserInputEventType.ButtonClickEvent);
  assert(event.name === 'increment');

  const count = await increment();

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <Counter count={count} />,
    },
  });
};
