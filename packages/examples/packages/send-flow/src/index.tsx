import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnHomePageHandler,
  OnUserInputHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';

import { SendFlow } from './components';
import type { SendFormState, SendFlowContext } from './types';
import { formValidation, generateSendFlow, isCaipHexAddress } from './utils';

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
      const { currency } = await snap.request({
        method: 'snap_getPreferences',
      });

      const interfaceId = await generateSendFlow({
        fees: { amount: 1.0001, fiat: 1.23 },
        fiatCurrency: currency,
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
  const { currency } = await snap.request({
    method: 'snap_getPreferences',
  });

  const interfaceId = await generateSendFlow({
    fees: { amount: 1.0001, fiat: 1.23 },
    fiatCurrency: currency,
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
  const { useFiat, fiatCurrency, fees } = context as SendFlowContext;

  const state = await snap.request({
    method: 'snap_getInterfaceState',
    params: { id },
  });

  const sendForm = state.sendForm as SendFormState;

  const formErrors = formValidation(sendForm);

  const total = {
    amount: Number(sendForm.amount ?? 0) + fees.amount,
    fiat: 250 + fees.fiat,
  };

  if (
    event.type === UserInputEventType.ButtonClickEvent &&
    event.name === 'swap'
  ) {
    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: (
          <SendFlow
            useFiat={!useFiat}
            fiatCurrency={fiatCurrency}
            account={sendForm.account}
            asset={sendForm.asset}
            total={total}
            fees={fees}
            errors={formErrors}
            displayAvatar={isCaipHexAddress(sendForm.to)}
          />
        ),
        context: {
          ...context,
          useFiat: !useFiat,
        },
      },
    });
  }

  if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'amount':
      case 'to': {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                account={sendForm.account}
                useFiat={useFiat}
                fiatCurrency={fiatCurrency}
                asset={sendForm.asset}
                total={total}
                fees={fees}
                errors={formErrors}
                // For testing purposes, we display the avatar if the address is
                // a valid hex checksum address.
                displayAvatar={isCaipHexAddress(
                  event.name === 'to' ? event.value : sendForm.to,
                )}
              />
            ),
          },
        });
        break;
      }

      case 'account': {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                account={sendForm.account}
                asset={sendForm.asset}
                useFiat={useFiat}
                fiatCurrency={fiatCurrency}
                total={total}
                fees={fees}
                errors={formErrors}
                displayAvatar={isCaipHexAddress(sendForm.to)}
              />
            ),
          },
        });

        break;
      }

      case 'asset': {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <SendFlow
                account={sendForm.account}
                asset={sendForm.asset}
                useFiat={useFiat}
                fiatCurrency={fiatCurrency}
                total={total}
                fees={fees}
                errors={formErrors}
                displayAvatar={isCaipHexAddress(sendForm.to)}
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
