import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import { transactionInsightEndowmentBuilder } from './transaction-insight';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
  [transactionInsightEndowmentBuilder.targetKey]:
    transactionInsightEndowmentBuilder,
} as const;

export * from './enum';
