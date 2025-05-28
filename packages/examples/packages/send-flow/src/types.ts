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
 * @property accountSelector - The selected account.
 */
export type SendFormState = {
  account: AccountSelectorState;
  asset: AssetSelectorState;
  to: string;
  amount: string;
  accountSelector: string;
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
 * An Account of the send flow interface.
 *
 * @property name - The name of the account.
 * @property address - The address of the account.
 * @property balance - The balance of the account.
 * @property icon - The icon of the account.
 */
export type Account = {
  name: string;
  address: string;
  balance: Currency;
  icon: string;
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
 * @property accounts - The available accounts.
 * @property selectedCurrency - The selected currency.
 * @property fees - The fees for the transaction.
 */
export type SendFlowContext = {
  useFiat: boolean;
  fees: Currency;
  fiatCurrency: string;
};
