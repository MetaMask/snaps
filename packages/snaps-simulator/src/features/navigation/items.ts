import { HandlerType } from '@metamask/snaps-utils';

import type { IconName } from '../../components';
import type { ApplicationState } from '../../store';

type ConditionFunction = (state: ApplicationState) => boolean;

export type NavigationItem = {
  label: string;
  tag: string;
  description: string;
  icon: IconName;
  path: string;

  /**
   * Conditionally render the navigation item. If not provided, the item will
   * always be rendered.
   */
  condition?: ConditionFunction;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'JSON-RPC',
    tag: 'onRpcRequest',
    description: 'Send a JSON-RPC request to the snap',
    icon: 'jsonRpc',
    path: `/handler/${HandlerType.OnRpcRequest}`,
  },
  {
    label: 'Cronjobs',
    tag: 'onCronjob',
    description: 'Schedule and run periodic actions',
    icon: 'cronjob',
    path: `/handler/${HandlerType.OnCronjob}`,
  },
  {
    label: 'Transaction',
    tag: 'onTransaction',
    description: 'Send a transaction to the snap',
    icon: 'insights',
    path: `/handler/${HandlerType.OnTransaction}`,
  },
  {
    label: 'UI Builder',
    tag: 'ui',
    description: 'Build a user interface for the snap',
    icon: 'ui',
    path: '/builder',
  },
];
