import type {
  OnRpcRequestHandler,
  OnHomePageHandler,
  OnTransactionHandler,
  OnUserInputHandler,
  Transaction,
} from '@metamask/snaps-sdk';
import { UserInputEventType, MethodNotFoundError } from '@metamask/snaps-sdk';

import type { InteractiveFormState } from './components';
import {
  InteractiveForm,
  Result,
  Insight,
  TransactionType,
} from './components';
import { decodeData } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates
 * that a snap can show an interactive `snap_dialog` that the user can interact with.
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
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: <InteractiveForm />,
        },
      });
    }

    default:
      throw new MethodNotFoundError({
        method: request.method,
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
  return { content: <InteractiveForm /> };
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
  const { from, to } = transaction;

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: <Insight from={from} to={to} />,
      context: { transaction },
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
 * @param params.context - The Snap interface context.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({
  id,
  event,
  context,
}) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'transaction-type': {
        const transaction = context?.transaction as Transaction;

        const type = decodeData(transaction.data);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <TransactionType type={type} />,
          },
        });
        break;
      }

      case 'go-back': {
        const transaction = context?.transaction as Transaction;
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <Insight from={transaction.from} to={transaction.to} />,
          },
        });
        break;
      }

      case 'back':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <InteractiveForm />,
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
    const value = event.value as InteractiveFormState;
    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: <Result values={value} />,
      },
    });
  }
};
