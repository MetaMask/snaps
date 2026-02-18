import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  DialogType,
  MethodNotFoundError,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import { Box, Heading, Link, Text } from '@metamask/snaps-sdk/jsx';

import { CustomDialog } from './components';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods, one for each
 * type of dialog:
 *
 * - `showAlert`: Show an alert dialog.
 * - `showConfirmation`: Show a confirmation dialog.
 * - `showPrompt`: Show a prompt dialog.
 * - `showCustom`: Show a custom dialog with the resolution handled by the snap.
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
          content: (
            <Box>
              <Heading>Alert Dialog</Heading>
              <Text>
                This is an alert dialog. It has a single button: "OK".
              </Text>
            </Box>
          ),
        },
      });

    case 'showConfirmation':
      return snap.request({
        method: 'snap_dialog',
        params: {
          // For this example we're using `DialogType.Confirmation`, but you can
          // also use the literal string value "confirmation" here.
          type: DialogType.Confirmation,
          content: (
            <Box>
              <Heading>Confirmation Dialog</Heading>
              <Text>
                This is a confirmation dialog. It has two buttons: "OK" and
                "Cancel," letting the user choose whether to proceed with an
                action.
                <Link href="https://snaps.metamask.io/">That</Link> is a what a
                link looks like.
              </Text>
            </Box>
          ),
        },
      });

    case 'showPrompt':
      return snap.request({
        method: 'snap_dialog',
        params: {
          // For this example we're using `DialogType.Prompt`, but you can also
          // use the literal string value "prompt" here.
          type: DialogType.Prompt,
          content: (
            <Box>
              <Heading>Prompt Dialog</Heading>
              <Text>
                This is a prompt dialog. In addition to the "OK" and "Cancel"
                buttons, it has a text input field.
              </Text>
            </Box>
          ),
          placeholder: 'This is shown in the input.',
        },
      });

    case 'showCustom':
      return snap.request({
        method: 'snap_dialog',
        params: {
          content: <CustomDialog />,
        },
      });

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

/**
 * Handle incoming user events coming from the MetaMask clients open interfaces.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'cancel':
        await snap.request({
          method: 'snap_resolveInterface',
          params: {
            id,
            value: null,
          },
        });
        break;

      case 'confirm': {
        const state = await snap.request({
          method: 'snap_getInterfaceState',
          params: {
            id,
          },
        });

        const value = state['custom-input'];

        await snap.request({
          method: 'snap_resolveInterface',
          params: {
            id,
            value,
          },
        });
        break;
      }

      default:
        break;
    }
  }
};
