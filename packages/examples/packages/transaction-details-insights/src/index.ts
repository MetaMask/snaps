import type { OnTransactionDetailsHandler } from '@metamask/snaps-sdk';
import { SeverityLevel, panel, text, row, address } from '@metamask/snaps-sdk';

/**
 * This event is called when a user clicks on a transaction to bring up the
 * transaction details modal
 *
 * The `onTransactionDetails` handler returns a Snaps UI component, which is displayed
 * in the transaction details insights panel (transaction details modal).
 *
 * @param args - The request parameters.
 * @param args.transactionMeta - The transaction object. This contains the
 * transaction parameters, such as the `from`, `to`, `value`, and `data` fields.
 * @param args.origin - The origin of the transaction. A URL is the transaction originated
 * from a website or, for example, 'Metamask' if the transaction was initiated by the user.
 * @param args.chainId - The chain ID of the transaction.
 * @param args.selectedAddress - The address of the account that initiated the transaction.
 * @param args.selectedAccount - The account object of the account that initiated the transaction.
 * @returns The transaction details insights.
 */

export const onTransactionDetails: OnTransactionDetailsHandler = async ({
  transactionMeta,
  origin,
  chainId,
  selectedAddress,
  selectedAccount,
}) => {
  const { txParams } = transactionMeta;
  const { from, to }: { from: string; to: string } = txParams as {
    from: string;
    to: string;
  };

  // this is a good place to do an async HTTP request to fetch insights from a remote server

  return {
    content: panel([
      row('From', address(from as `0x${string}`)),
      row('To', to ? address(to as `0x${string}`) : text('None')),
      row('Origin', text(origin)),
      row('Chain ID', text(chainId)),
      row('Selected Account', text(selectedAccount)),
      row('Our address', text(selectedAddress)),
    ]),
    severity: SeverityLevel.Critical,
  };
};
