import { MethodNotFoundError, UserInputEventType } from '@metamask/snaps-sdk';
import type {
  OnRpcRequestHandler,
  OnSettingsPageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';

import { Dialog, Result, Settings } from './components';

type SnapState = {
  setting1?: boolean;
  setting2?: 'option1' | 'option2';
  setting3?: 'option1' | 'option2';
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `showDialog` - Opens a dialog.
 * - `getSettings`: Get the settings state from the snap state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/snaps-api/#snap_dialog
 * @see https://docs.metamask.io/snaps/reference/snaps-api/#snap_managestate
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

    case 'getSettings':
      return await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'get',
          encrypted: false,
        },
      });

    default:
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new MethodNotFoundError({ method: request.method });
  }
};

/**
 * Handle incoming settings page requests from the MetaMask clients.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onsettingspage
 */
export const onSettingsPage: OnSettingsPageHandler = async () => {
  const state: SnapState | null = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
      encrypted: false,
    },
  });

  return {
    content: (
      <Settings
        setting1={state?.setting1}
        setting2={state?.setting2}
        setting3={state?.setting3}
      />
    ),
  };
};

/**
 * Handle incoming user events coming from the MetaMask clients open interfaces.
 *
 * @param params - The event parameters.
 * @param params.event - The event object containing the event type, name and value.
 * @param params.id - The unique identifier of the open interface.
 * @param params.context - The context object containing the current state of the open interface.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({
  event,
  id,
  context,
}) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
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

  if (event.type === UserInputEventType.FormSubmitEvent) {
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

  if (
    event.type === UserInputEventType.InputChangeEvent &&
    (event.name === 'setting1' ||
      event.name === 'setting2' ||
      event.name === 'setting3')
  ) {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
        encrypted: false,
      },
    });

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        encrypted: false,
        newState: {
          ...state,
          [event.name]: event.value,
        },
      },
    });
  }
};
