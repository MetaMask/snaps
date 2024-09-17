/**
 * The state of the send form.
 *
 * @property to - The receiving address.
 * @property amount - The amount to send.
 * @property accountSelector - The selected account.
 */
export type SendFormState = {
  to: string;
  amount: string;
  accountSelector: string;
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
  accounts: Record<string, Account>;
  selectedCurrency: 'BTC' | '$';
  fees: Currency;
};
