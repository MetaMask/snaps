import { add0x, hasProperty, isObject, remove0x } from '@metamask/utils';
import { decode } from '@metamask/abi-utils';

/**
 * As an example, get transaction insights by looking at the transaction data
 * and attempting to decode it.
 *
 * @param transaction - The transaction to get insights for.
 * @returns The transaction insights.
 */
export const getInsights = (transaction: Record<string, unknown>) => {
  try {
    // Check if the transaction has data.
    if (
      !isObject(transaction) ||
      !hasProperty(transaction, 'data') ||
      typeof transaction.data !== 'string'
    ) {
      return {
        type: 'Unknown transaction',
      };
    }

    const data = remove0x(transaction.data);

    // Get the function selector from the transaction data.
    const selector = data.slice(0, 8);

    // Check the function selector against the known selectors.
    switch (selector) {
      // Random "token transfer" example selector.
      case 'f0f0f0f0': {
        // Decode the transaction data.
        const [to, value] = decode(
          ['address', 'uint256'],
          add0x(data.slice(8)),
        );

        return {
          type: 'Sending Tokens',
          to,
          value: value.toString(10),
        };
      }

      // Random "NFT transfer" example selector.
      case 'e1e1e1e1': {
        // Decode the transaction data.
        const [to, id] = decode(['address', 'uint256'], add0x(data.slice(8)));

        return {
          type: 'Sending NFT',
          to,
          id: id.toString(10),
        };
      }

      default: {
        return {
          type: 'Unknown transaction',
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      type: 'Unknown transaction',
    };
  }
};
