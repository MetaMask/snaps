import { OnTransactionHandler } from '@metamask/snaps-types';
import { panel, text, copyable } from '@metamask/snaps-ui';

import { getInsights } from './insights';

/**
 * Handle an incoming transaction, and return any insights.
 *
 * @param args - The request handler args as object.
 * @param args.transaction - The transaction object.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const { type, args } = await getInsights(transaction);
  const content = panel([
    text(`**Type:** ${type}`),
    ...(args
      ? [text('**Args:**'), copyable(JSON.stringify(args, null, 2))]
      : []),
  ]);
  return {
    content,
  };
};
