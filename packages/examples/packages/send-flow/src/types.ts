import type {
  AccountSelectorState,
  AssetSelectorState,
} from '@metamask/snaps-sdk';

/**
 * The state of the send form.
 *
 * @property account - The selected account.
 * @property asset - The selected asset.
 * @property to - The receiving address.
 * @property amount - The amount to send.
 */
export type SendFormState = {
  account: AccountSelectorState;
  asset: AssetSelectorState;
  to: string;
  amount: string;
};

/**
 * The state of the send flow interface.
 *
 * @property sendForm - The state of the send form.
 */
export type SendFlowState = {
  sendForm: SendFormState;
};

/**
 * The form errors.
 *
 * @property to - The error for the receiving address.
 * @property amount - The error for the amount.
 */
export type SendFormErrors = {
  to?: string;
  amount?: string;
};

/**
 * A currency value.
 *
 * @property amount - The amount in the selected currency.
 * @property fiat - The amount in fiat currency.
 */
export type Currency = {
  amount: number;
  fiat: number;
};

/**
 * The context of the send flow interface.
 *
 * @property useFiat - Whether to use fiat currency.
 * @property fees - The fees for the transaction.
 * @property fiatCurrency - The fiat currency to use.
 */
export type SendFlowContext = {
  useFiat: boolean;
  fees: Currency;
  fiatCurrency: string;
};
