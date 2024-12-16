import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  MethodNotFoundError,
  UserInputEventType,
  type OnSettingsPageHandler,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';

import { SettingsPage } from './components/SettingsPage';

type SnapState = {
  setting1?: boolean;
  setting2?: 'option1' | 'option2';
  setting3?: 'option1' | 'option2';
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `getSettings`: get the settings state from the snap state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/snaps-api/#snap_managestate
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getSettings':
      return await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'get',
          encrypted: false,
        },
      });
    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
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
      <SettingsPage
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
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ event }) => {
  if (event.type === UserInputEventType.InputChangeEvent) {
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
