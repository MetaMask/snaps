import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import { txInsightEndowmentBuilder } from './tx-insight';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
  [txInsightEndowmentBuilder.targetKey]: txInsightEndowmentBuilder,
} as const;

export * from './constants';
