import { SendFlow } from './components';
import type { Currency, SendFormErrors, SendFormState } from './types';

export type GenerateSendFlowParams = {
  fees: Currency;
};

/**
 * Generate the send flow.
 *
 * @param params - The parameters for the send form.
 * @param params.fees - The fees for the transaction.
 * @returns The interface ID.
 */
export async function generateSendFlow({ fees }: GenerateSendFlowParams) {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: (
        <SendFlow
          selectedCurrency="BTC"
          total={{ amount: 0, fiat: 0 }}
          fees={fees}
          displayClearIcon={false}
        />
      ),
      context: {
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
 * @returns The form errors.
 */
export function formValidation(formState: SendFormState): SendFormErrors {
  const errors: Partial<SendFormErrors> = {};

  if (formState.to === 'invalid address') {
    errors.to = 'Invalid address';
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
