import { txInsightEndowmentBuilder } from './tx-insight';

export const endowmentPermissionBuilders = {
  [txInsightEndowmentBuilder.targetKey]: txInsightEndowmentBuilder,
} as const;

export * from './constants';
