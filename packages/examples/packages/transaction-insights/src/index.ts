import { OnTransactionHandler } from '@metamask/snaps-types';
import { text } from '@metamask/snaps-ui';
import { hasProperty, isObject } from '@metamask/utils';

/**
 * Handle an incoming transaction, and return any insights.
 *
 * @param args - The request handler args as object.
 * @param args.transaction - The transaction object.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    // eslint-disable-next-line no-console
    console.warn('Unknown transaction type.');
    return { content: text('Unknown transaction') };
  }

  return { content: text('**Test:** Successful') };
};
