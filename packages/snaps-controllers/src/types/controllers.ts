import type { ControllerStateChangeEvent } from '@metamask/base-controller';
import type { Hex, Json } from '@metamask/utils';

// Partial types that should overlap with types from controllers.
export type TransactionMeta = {
  /**
   * Generated UUID associated with this transaction.
   */
  id: string;

  /**
   * Network code as per EIP-155 for this transaction.
   */
  chainId: Hex;

  /**
   * Origin this transaction was sent from.
   */
  origin?: string;

  /**
   * Underlying Transaction object.
   */
  txParams: TransactionParams;

  /**
   * The status of the transaction.
   */
  status: string;
};

/**
 * Standard data concerning a transaction to be processed by the blockchain.
 */
export type TransactionParams = {
  /**
   * Network ID as per EIP-155.
   */
  chainId?: Hex;

  /**
   * Data to pass with this transaction.
   */
  data?: string;

  /**
   * Error message for gas estimation failure.
   */
  estimateGasError?: string;

  /**
   * Estimated base fee for this transaction.
   */
  estimatedBaseFee?: string;

  /**
   * Which estimate level that the API suggested.
   */
  estimateSuggested?: string;

  /**
   * Which estimate level was used
   */
  estimateUsed?: string;

  /**
   * Address to send this transaction from.
   */
  from: string;

  /**
   * same as gasLimit?
   */
  gas?: string;

  /**
   * Maxmimum number of units of gas to use for this transaction.
   */
  gasLimit?: string;

  /**
   * Price per gas for legacy txs
   */
  gasPrice?: string;

  /**
   * Gas used in the transaction.
   */
  gasUsed?: string;

  /**
   * Maximum amount per gas to pay for the transaction, including the priority
   * fee.
   */
  maxFeePerGas?: string;

  /**
   * Maximum amount per gas to give to validator as incentive.
   */
  maxPriorityFeePerGas?: string;

  /**
   * Unique number to prevent replay attacks.
   */
  nonce?: string;

  /**
   * Address to send this transaction to.
   */
  to?: string;

  /**
   * Value associated with this transaction.
   */
  value?: string;

  /**
   * Type of transaction.
   * 0x0 indicates a legacy transaction.
   */
  type?: string;
};

export type TransactionControllerUnapprovedTransactionAddedEvent = {
  type: `TransactionController:unapprovedTransactionAdded`;
  payload: [transactionMeta: TransactionMeta];
};

export type TransactionControllerTransactionStatusUpdatedEvent = {
  type: `TransactionController:transactionStatusUpdated`;
  payload: [
    {
      transactionMeta: TransactionMeta;
    },
  ];
};

export type StateSignatureParams = {
  from: string;
  origin?: string;
  deferSetAsSigned?: boolean;
  data: string | Record<string, Json>;
  signatureMethod: string;
};

export type StateSignature = {
  id: string;
  msgParams: StateSignatureParams;
};

export type SignatureControllerState = {
  unapprovedPersonalMsgs: Record<string, StateSignature>;
  unapprovedTypedMessages: Record<string, StateSignature>;
  unapprovedPersonalMsgCount: number;
  unapprovedTypedMessagesCount: number;
};

const signatureControllerName = 'SignatureController';

export type SignatureStateChange = ControllerStateChangeEvent<
  typeof signatureControllerName,
  SignatureControllerState
>;
