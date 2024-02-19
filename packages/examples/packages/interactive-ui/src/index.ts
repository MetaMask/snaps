import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnRpcRequestHandler,
  OnHomePageHandler,
  OnTransactionHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  UserInputEventType,
  ManageStateOperation,
  assert,
} from '@metamask/snaps-sdk';

import {
  createInterface,
  displayTransactionType,
  getInsightContent,
  showForm,
  showResult,
} from './ui';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates
 * that a snap can show an interactive `snap_dialog` that the user can interact with.
 *
 * - `getState`: Get the state of a given interface. This demonstrates
 * that a snap can retrieve an interface state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'dialog': {
      try {
        const interfaceId = await createInterface();

        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.UpdateState,
            newState: { interfaceId },
            encrypted: false,
          },
        });

        return await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            id: interfaceId,
          },
        });
      } finally {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.ClearState,
            encrypted: false,
          },
        });
      }
    }

    case 'getState': {
      const snapState = await snap.request({
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.GetState,
          encrypted: false,
        },
      });

      assert(snapState?.interfaceId, 'No interface ID found in state.');

      const state = await snap.request({
        method: 'snap_getInterfaceState',
        params: {
          id: snapState.interfaceId as string,
        },
      });

      return state;
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
 * Handle incoming home page requests from the MetaMask clients.
 * Create a new Snap Interface and return it.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onhomepage
 */
export const onHomePage: OnHomePageHandler = async () => {
  const interfaceId = await createInterface();

  return { id: interfaceId };
};

/**
 * Handle incoming transactions, sent through the `wallet_sendTransaction`
 * method. This handler decodes the transaction data, and displays the type of
 * transaction in the transaction insights panel.
 *
 * The `onTransaction` handler is different from the `onRpcRequest` handler in
 * that it is called by MetaMask when a transaction is initiated, rather than
 * when a dapp sends a JSON-RPC request. The handler is called before the
 * transaction is signed, so it can be used to display information about the
 * transaction to the user before they sign it.
 *
 * The `onTransaction` handler returns a Snaps interface ID, which is used to
 * retrieve the associated interface components in the transaction insights panel.
 *
 * @param args - The request parameters.
 * @param args.transaction - The transaction object. This contains the
 * transaction parameters, such as the `from`, `to`, `value`, and `data` fields.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.UpdateState,
      newState: { transaction },
    },
  });

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: await getInsightContent(),
    },
  });

  return { id: interfaceId };
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
      case 'update':
        await showForm(id);
        break;

      case 'transaction-type':
        await displayTransactionType(id);
        break;

      case 'go-back':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: await getInsightContent(),
          },
        });
        break;

      default:
        break;
    }
  }

  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'example-form'
  ) {
    const inputValue = event.value['example-input'];
    await showResult(id, inputValue);
  }
};
