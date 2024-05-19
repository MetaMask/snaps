import type { ComponentOrElement } from '..';
import type { EnumToUnion } from '../../internals';
import type { ChainId } from '../caip';

/**
 * The severity level of content being returned from a transaction insight.
 * Currently only one level is supported:
 *
 * - `critical` - The transaction is critical and should not be submitted by the
 * user.
 */
export enum SeverityLevel {
  Critical = 'critical',
}

/**
 * An EIP-1559 (type 2) transaction object.
 *
 * @property from - The address the transaction is being sent from.
 * @property to - The address the transaction is being sent to.
 * @property nonce - The nonce of the transaction.
 * @property value - The value of the transaction.
 * @property data - The data of the transaction.
 * @property gas - The gas limit of the transaction.
 * @property maxFeePerGas - The maximum fee per gas of the transaction.
 * @property maxPriorityFeePerGas - The maximum priority fee per gas of the
 * transaction.
 * @property estimateSuggested - The suggested gas price for the transaction.
 * @property estimateUsed - The gas price used for the transaction.
 * @see https://eips.ethereum.org/EIPS/eip-1559
 */
export type EIP1559Transaction = {
  from: string;
  to: string;
  nonce: string;
  value: string;
  data: string;
  gas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  estimateSuggested: string;
  estimateUsed: string;
};

/**
 * A legacy (type "0") transaction object.
 *
 * @property from - The address the transaction is being sent from.
 * @property to - The address the transaction is being sent to.
 * @property nonce - The nonce of the transaction.
 * @property value - The value of the transaction.
 * @property data - The data of the transaction.
 * @property gas - The gas limit of the transaction.
 * @property gasPrice - The gas price of the transaction.
 * @property estimateSuggested - The suggested gas price for the transaction.
 * @property estimateUsed - The gas price used for the transaction.
 */
export type LegacyTransaction = {
  from: string;
  to: string;
  nonce: string;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  estimateSuggested: string;
  estimateUsed: string;
};

/**
 * A transaction object. This can be either an EIP-1559 transaction or a legacy
 * transaction.
 *
 * @see EIP1559Transaction
 * @see LegacyTransaction
 */
export type Transaction = EIP1559Transaction | LegacyTransaction;

/**
 * The `onTransaction` handler. This is called whenever a transaction is
 * submitted to the snap. It can return insights about the transaction, which
 * will be displayed to the user.
 *
 * Note that using this handler requires the `endowment:transaction-insights`
 * permission.
 *
 * @param args - The request arguments.
 * @param args.transaction - The transaction object, containing the address,
 * value, data, and other properties of the transaction.
 * @param args.chainId - The CAIP-2 {@link ChainId} of the network the
 * transaction is being submitted to.
 * @param args.transactionOrigin - The origin of the transaction. This is the
 * URL of the website that submitted the transaction. This is only available if
 * the Snap has enabled the `allowTransactionOrigin` option in the
 * `endowment:transaction-insight` permission.
 * @returns An object containing insights about the transaction. See
 * {@link OnTransactionResponse}. Can also return `null` if no insights are
 * available.
 */
export type OnTransactionHandler = (args: {
  transaction: Transaction;
  chainId: ChainId;
  transactionOrigin?: string;
}) => Promise<OnTransactionResponse | null>;

/**
 * The response from a Snap's `onTransaction` handler.
 *
 * @property component - A custom UI component, that will be shown in MetaMask.
 * @property id - A Snap interface ID.
 * @property severity - The severity level of the content. Currently only one
 * level is supported: `critical`.
 */
export type OnTransactionResponse =
  | {
      content: ComponentOrElement;
      severity?: EnumToUnion<SeverityLevel>;
    }
  | {
      id: string;
      severity?: EnumToUnion<SeverityLevel>;
    };
