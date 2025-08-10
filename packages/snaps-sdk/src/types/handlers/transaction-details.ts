import type { ComponentOrElement } from '..';

/**
 * This event is called when a user clicks on a transaction to bring up the
 * transaction details modal
 *
 * The `onTransactionDetails` handler returns a Snaps UI component, which is displayed
 * in the transaction details insights panel (transaction details modal).
 *
 * @param params - The request parameters.
 * @param params.transactionMeta - The transaction object. This contains the
 * transaction parameters, such as the `from`, `to`, `value`, and `data` fields.
 * @param params.origin - The origin of the transaction. A URL is the transaction originated
 * from a website or, for example, 'Metamask' if the transaction was initiated by the user.
 * @param params.chainId - The chain ID of the transaction.
 * @param params.selectedAddress - The address of the account that initiated the transaction.
 * @param params.selectedAccount - The account object of the account that initiated the transaction.
 * @returns The transaction details insights.
 */
export type OnTransactionDetailsHandler = (
  params: OnTransactionDetailsParams,
) => Promise<OnTransactionDetailsResponse>;

export type OnTransactionDetailsParams = {
  /**
   * The transaction details data.
   */
  transactionMeta: {
    /** Unique transaction identifier */
    id: string;
    /** Transaction hash */
    hash: string;
    /** Transaction type */
    type: string;
    /** Transaction timestamp */
    timestamp: number;
    /** Transaction value (optional) */
    value?: string;
    /** From address (optional) */
    from?: string;
    /** To address (optional) */
    to?: string;
    /** Additional transaction properties */
    [key: string]: unknown;
  };

  /**
   * The chain ID of the network.
   */
  chainId: string;

  /**
   * The origin of the activity view request.
   */
  origin?: string;

  /**
   * The selected address of the user.
   */
  selectedAddress: string;

  /**
   * The selected account of the user.
   */
  selectedAccount: any;
};

/**
 * The response from a Snap's `onTransactionDetails` handler.
 *
 * @property id - A unique identifier for the insight interface.
 * @property severity - The severity level of the insight. Currently only one
 * level is supported: `critical`.
 * @property content - Optional content to display in the transaction details view.
 */
export type OnTransactionDetailsResponse = {
  /**
   * A unique identifier for the insight interface.
   */
  id?: string;

  /**
   * The severity level of the insight.
   */
  severity?: 'critical' | 'warning' | 'info';

  /**
   * Optional content to display.
   */
  content?: ComponentOrElement;
};
