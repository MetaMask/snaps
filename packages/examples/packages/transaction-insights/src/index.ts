import type { OnTransactionHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { hasProperty } from '@metamask/utils';

import { decodeData } from './utils';

/**
 * Handle incoming transactions, sent through the `wallet_sendTransaction`
 * method. This handler decodes the transaction data, and displays the type of
 * transaction in the transaction insights panel.
 *
 * The `onTransaction` handler is different from the `onRpcRequest` handler in
 * that it is called by MetaMask when a transaction is initiated, rather than
 * when a dapp sends a JSON-RPC request. The handler is called before the
 * transaction is signed, so it can be used to display information about the
 * transaction to the user before they sign it.
 *
 * The `onTransaction` handler returns a Snaps UI component, which is displayed
 * in the transaction insights panel.
 *
 * @param args - The request parameters.
 * @param args.transaction - The transaction object. This contains the
 * transaction parameters, such as the `from`, `to`, `value`, and `data` fields.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  if (
    hasProperty(transaction, 'data') &&
    typeof transaction.data === 'string'
  ) {
    const type = decodeData(transaction.data);
    return { content: panel([text('**Transaction type:**'), text(type)]) };
  }

  return { content: panel([text('**Transaction type:**'), text('Unknown')]) };
};
