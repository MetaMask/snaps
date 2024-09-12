import { rpcErrors } from '@metamask/rpc-errors';
import type { OnUserInputHandler } from '@metamask/snaps-sdk';
import {
  UserInputEventType,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import type { Account } from './components';
import { SendFlow } from './components';
import jazzicon1 from './images/jazzicon1.svg';
import jazzicon2 from './images/jazzicon2.svg';
import type { SendFormState } from './utils';
import { formValidation } from './utils';

const accounts: Record<string, Account> = {
  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh: {
    name: 'My Bitcoin Account',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: 1.8,
    fiatBalance: 92000,
    icon: jazzicon1,
  },
  bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3: {
    name: 'Savings Account',
    address: 'bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3',
    balance: 2.5,
    fiatBalance: 150000,
    icon: jazzicon2,
  },
};

const accountsArray = Object.values(accounts);

export type Context = {
  accounts: Record<string, Account>;
  selectedCurrency: 'BTC' | '$';
  fees: { amount: number; fiat: number };
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `display`: Display a dialog with a counter, and a button to increment the
 * counter. This demonstrates how to display a dialog with JSX content, and how
 * to handle user input events.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const fees = { amount: 1.0001, fiat: 1.23 };

  switch (request.method) {
    case 'display': {
      const interfaceId = await snap.request({
        method: 'snap_createInterface',
        params: {
          ui: (
            <SendFlow
              accounts={accountsArray}
              selectedAccount={accountsArray[0].address}
              selectedCurrency="BTC"
              total={{ amount: 0, fiat: 0 }}
              fees={fees}
              toAddress={null}
            />
          ),
          context: {
            accounts,
            selectedCurrency: 'BTC',
            fees,
          },
        },
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
 * Handle incoming user events coming from the Snap interface. This handler
 * handles one event:
 *
 * - `increment`: Increment the counter and update the Snap interface with the
 * new count. It is triggered when the user clicks the increment button.
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
  const { selectedCurrency, fees } = context as Context;
  if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'amount':
      case 'to':
      case 'accountSelector': {
        const state = await snap.request({
          method: 'snap_getInterfaceState',
          params: { id },
        });

        const sendForm = state.sendForm as SendFormState;

        const formErrors = formValidation(sendForm, context as Context);

        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                accounts={accountsArray}
                selectedAccount={sendForm.accountSelector}
                selectedCurrency={selectedCurrency}
                total={{
                  amount: Number(sendForm.amount) + fees.amount,
                  fiat: 250 + fees.fiat,
                }}
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
  }
};
