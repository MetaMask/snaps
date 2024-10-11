import { MethodNotFoundError } from '@metamask/snaps-sdk';
import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';

import { Dialog, Result } from './components';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `showDialog` - Opens a dialog.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_notify
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'showDialog':
      return await snap.request({
        method: 'snap_dialog',
        params: {
          content: <Dialog />,
        },
      });

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};

export const onUserInput: OnUserInputHandler = async ({
  event,
  id,
  context,
}) => {
  if (event.type === 'ButtonClickEvent') {
    if (event.name === 'cancel') {
      await snap.request({
        method: 'snap_resolveInterface',
        params: {
          id,
          value: null,
        },
      });
    }

    if (event.name === 'ok') {
      await snap.request({
        method: 'snap_resolveInterface',
        params: {
          id,
          value: String(context?.value),
        },
      });
    }
  }

  if (event.type === 'FormSubmitEvent') {
    if (event.name === 'form') {
      const value = String(event.value['custom-input']);
      await snap.request({
        method: 'snap_updateInterface',
        params: {
          id,
          ui: <Result value={value} />,
          context: { value },
        },
      });
    }
  }
};
