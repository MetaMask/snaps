import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnHomePageHandler,
  OnTransactionHandler,
  OnUserInputHandler,
  Transaction,
  Component,
} from '@metamask/snaps-sdk';
import {
  panel,
  type OnRpcRequestHandler,
  heading,
  button,
  UserInputEventType,
  form,
  input,
  ButtonType,
  text,
  copyable,
  ManageStateOperation,
  assert,
  address,
  row,
} from '@metamask/snaps-sdk';
import { hasProperty } from '@metamask/utils';

import { decodeData } from './utils';

/**
 * Initiate a new interface with the starting screen.
 *
 * @returns The Snap interface ID.
 */
export async function createInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: panel([
        heading('Interactive UI Example Snap'),
        button({ value: 'Update UI', name: 'update' }),
      ]),
    },
  });
}

/**
 * Create the transaction insights components to display.
 *
 * @returns The transaction insight content.
 */
export async function getInsightContent(): Promise<Component> {
  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  assert(snapState?.transaction, 'No transaction found in Snap state.');

  const { from, to } = snapState.transaction as Transaction;

  return panel([
    row('From', address(from)),
    row('To', to ? address(to) : text('None')),
    button({ value: 'See transaction type', name: 'transaction-type' }),
  ]);
}

/**
 * Updates a Snap interface to display the transaction type.
 *
 * @param id -  The interface ID to update.
 */
export async function displayTransactionType(id: string) {
  let type = 'unkown';

  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  assert(snapState?.transaction, 'No transaction found in Snap state.');

  const transaction = snapState.transaction as Transaction;

  if (
    hasProperty(transaction, 'data') &&
    typeof transaction.data === 'string'
  ) {
    type = decodeData(transaction.data);
  }

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        row('Transaction type', text(type)),
        button({ value: 'Go back', name: 'go-back' }),
      ]),
    },
  });
}

/**
 * Update the interface with a simple form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 */
export async function showForm(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Interactive UI Example Snap'),
        form({
          name: 'example-form',
          children: [
            input({
              name: 'example-input',
              placeholder: 'Enter something...',
            }),
            button('Submit', ButtonType.Submit, 'sumbit'),
          ],
        }),
      ]),
    },
  });
}

/**
 * Update a Snap interface to show a given value.
 *
 * @param id - The Snap interface ID to update.
 * @param value - The value to display in the UI.
 */
export async function showResult(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Interactive UI Example Snap'),
        text('The submitted value is:'),
        copyable(value),
      ]),
    },
  });
}

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
  if (
    event.type === UserInputEventType.ButtonClickEvent &&
    event.name === 'update'
  ) {
    await showForm(id);
    return;
  }

  if (
    event.type === UserInputEventType.ButtonClickEvent &&
    event.name === 'transaction-type'
  ) {
    await displayTransactionType(id);
    return;
  }

  if (
    event.type === UserInputEventType.ButtonClickEvent &&
    event.name === 'go-back'
  ) {
    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: await getInsightContent(),
      },
    });
    return;
  }

  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'example-form'
  ) {
    const inputValue = event.value['example-input'];
    await showResult(id, inputValue);
  }
};
