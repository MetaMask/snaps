import { SendFlow } from './components';
import type {
  Account,
  Currency,
  SendFlowContext,
  SendFormErrors,
  SendFormState,
} from './types';

export type GenerateSendFlowParams = {
  accounts: Account[];
  fees: Currency;
};

/**
 * Generate the send flow.
 *
 * @param params - The parameters for the send form.
 * @param params.accounts - The available accounts.
 * @param params.fees - The fees for the transaction.
 * @returns The interface ID.
 */
export async function generateSendFlow({
  accounts,
  fees,
}: GenerateSendFlowParams) {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: (
        <SendFlow
          accounts={accounts}
          selectedAccount={accounts[0].address}
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
}

/**
 * Validate the send form.
 *
 * @param formState - The state of the send form.
 * @param context - The context of the interface.
 * @returns The form errors.
 */
export function formValidation(
  formState: SendFormState,
  context: SendFlowContext,
): SendFormErrors {
  const errors: Partial<SendFormErrors> = {};

  if (formState.to === 'invalid address') {
    errors.to = 'Invalid address';
  }

  if (!formState.amount) {
    errors.amount = 'Required';
  } else if (
    Number(formState.amount) >
    context.accounts[formState.accountSelector].balance.amount
  ) {
    errors.amount = 'Insufficient funds';
  }

  return errors;
}

/**
 * Truncate a string to a given length.
 *
 * @param str - The string to truncate.
 * @param length - The number of characters to truncate the string to.
 * @returns The truncated string.
 */
export function truncate(str: string, length: number): string {
  return str.length > length
    ? `${str.slice(0, 5)}...${str.slice(str.length - 5, str.length)}`
    : str;
}
