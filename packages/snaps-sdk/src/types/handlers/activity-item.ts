import type { ComponentOrElement } from '..';

/**
 * The `onViewActivityItem` handler. This is called when a user views an activity item.
 *
 * @param params - The activity item parameters.
 * @returns The response from the handler.
 */
export type OnViewActivityItemHandler = (
  params: OnViewActivityItemParams,
) => Promise<OnViewActivityItemResponse>;

export type OnViewActivityItemParams = {
  /**
   * The activity item data.
   */
  transactionMeta: {
    id: string;
    hash: string;
    type: string;
    timestamp: number;
    value?: string;
    from?: string;
    to?: string;
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

export type OnViewActivityItemResponse = {
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
