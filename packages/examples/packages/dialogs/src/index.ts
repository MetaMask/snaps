import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { DialogType } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods, one for each
 * type of dialog:
 *
 * - `showAlert`: Show an alert dialog.
 * - `showConfirmation`: Show a confirmation dialog.
 * - `showPrompt`: Show a prompt dialog.
 *
 * The dialogs are shown using the [`snap_dialog`](https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog)
 * method.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'showAlert':
      return snap.request({
        method: 'snap_dialog',
        params: {
          // For this example we're using `DialogType.Alert`, but you can also
          // use the literal string value "alert" here.
          type: DialogType.Alert,
          content: panel([
            heading('Alert Dialog'),
            text('This is an alert dialog. It has a single button: "OK".'),
          ]),
        },
      });

    case 'showConfirmation':
      return snap.request({
        method: 'snap_dialog',
        params: {
          // For this example we're using `DialogType.Confirmation`, but you can
          // also use the literal string value "confirmation" here.
          type: DialogType.Confirmation,
          content: panel([
            heading('Confirmation Dialog'),
            text(
              'This is a confirmation dialog. It has two buttons: "OK" and "Cancel," letting the user choose whether to proceed with an action.',
            ),
          ]),
        },
      });

    case 'showPrompt':
      return snap.request({
        method: 'snap_dialog',
        params: {
          // For this example we're using `DialogType.Prompt`, but you can also
          // use the literal string value "prompt" here.
          type: DialogType.Prompt,
          content: panel([
            heading('Prompt Dialog'),
            text(
              'This is a prompt dialog. In addition to the "OK" and "Cancel" buttons, it has a text input field.',
            ),
          ]),
          placeholder: 'This is shown in the input.',
        },
      });

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
