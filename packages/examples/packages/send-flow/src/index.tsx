import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  UserInputEventType,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import { SendFlow } from './components';
import jazzicon1 from './images/jazzicon1.svg';
import jazzicon2 from './images/jazzicon2.svg';
import type { Account, SendFormState, SendFlowContext } from './types';
import { formValidation, generateSendFlow } from './utils';

/**
 * Example accounts data.
 */
const accounts: Record<string, Account> = {
  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh: {
    name: 'My Bitcoin Account',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: { amount: 1.8, fiat: 92000 },
    icon: jazzicon1,
  },
  bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3: {
    name: 'Savings Account',
    address: 'bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3',
    balance: { amount: 2.5, fiat: 150000 },
    icon: jazzicon2,
  },
};

/**
 * Example accounts data as an array.
 */
const accountsArray = Object.values(accounts);

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `display`: Display a dialog with the SendFlow interface.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'display': {
      const interfaceId = await generateSendFlow({
        accounts: accountsArray,
        fees: { amount: 1.0001, fiat: 1.23 },
      });

      return await snap.request({
        method: 'snap_dialog',
        params: {
          id: interfaceId,
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
 * Handle incoming home page requests from the MetaMask clients.
 *
 * @returns The interface ID for the send flow.
 * @see https://docs.metamask.io/snaps/reference/exports/#onhomepage
 */
export const onHomePage: OnHomePageHandler = async () => {
  const interfaceId = await generateSendFlow({
    accounts: accountsArray,
    fees: { amount: 1.0001, fiat: 1.23 },
  });

  return { id: interfaceId };
};

/**
 * Handle incoming user events coming from the Snap interface.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and
 * value.
 * @param params.context - The interface context.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({
  event,
  id,
  context,
}) => {
  const { selectedCurrency, fees } = context as SendFlowContext;

  const state = await snap.request({
    method: 'snap_getInterfaceState',
    params: { id },
  });

  const sendForm = state.sendForm as SendFormState;

  const formErrors = formValidation(sendForm, context as SendFlowContext);

  const total = {
    amount: Number(sendForm.amount) + fees.amount,
    fiat: 250 + fees.fiat,
  };

  if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'amount':
      case 'to':
      case 'accountSelector': {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                accounts={accountsArray}
                selectedAccount={sendForm.accountSelector}
                selectedCurrency={selectedCurrency}
                total={total}
                fees={fees}
                toAddress={sendForm.to}
                errors={formErrors}
              />
            ),
          },
        });

        break;
      }
      default:
        break;
    }
  } else if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'clear':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                accounts={accountsArray}
                selectedAccount={sendForm.accountSelector}
                selectedCurrency={selectedCurrency}
                total={total}
                fees={fees}
                toAddress={null}
                errors={formErrors}
              />
            ),
          },
        });
        break;
      default:
        break;
    }
  }
};
