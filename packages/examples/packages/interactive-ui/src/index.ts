import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnHomePageHandler,
  OnTransactionHandler,
  OnUserInputHandler,
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
} from '@metamask/snaps-sdk';

/**
 * Initiate a new interface with the starting screen and return the Snap interface ID.
 *
 * @returns The Snap interface ID.
 */
export const createInterface = async (): Promise<string> =>
  snap.request({
    method: 'snap_createInterface',
    params: {
      ui: panel([
        heading('Interactive UI Example Snap'),
        button({ value: 'Update UI', name: 'update' }),
      ]),
    },
  });

/**
 * Update the interface with a simple form containing an input and a submit button.
 *
 * @param id - The Snap interface ID to update.
 */
export const showForm = async (id: string) => {
  snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Interactive UI Example Snap'),
        form({
          name: 'example-form',
          children: [
            input({ name: 'example-input', placeholder: 'Enter something...' }),
            button('Submit', ButtonType.Submit, 'sumbit'),
          ],
        }),
      ]),
    },
  });
};

/**
 * Update a Snap interface to show a given value.
 *
 * @param id - The Snap interface ID to update.
 * @param value - The value to display in the UI.
 */
export const showResult = async (id: string, value: string) => {
  snap.request({
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
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates
 * that a snap can show an interactive `snap_dialog` that the user can interact with.
 *
 * - `get_state`: Get the state of a given interface. This demonstrates
 * that a snap can retrieve an interface state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler<{ id: string }> = async ({
  request,
}) => {
  switch (request.method) {
    case 'dialog': {
      const interfaceId = await createInterface();

      snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          id: interfaceId,
        },
      });

      return interfaceId;
    }

    case 'get_state': {
      if (!request.params?.id) {
        throw rpcErrors.invalidParams({
          message: 'Invalid Params: `get_state` needs an interface ID',
        });
      }

      const { id } = request.params;

      const state = await snap.request({
        method: 'snap_getInterfaceState',
        params: {
          id,
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
 * The `onTransaction` handler returns a Snaps interface ID, which is displayed
 * in the transaction insights panel.
 *
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async () => {
  const interfaceId = await createInterface();

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
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'example-form'
  ) {
    const inputValue = event.value['example-input'];
    await showResult(id, inputValue);
  }
};
