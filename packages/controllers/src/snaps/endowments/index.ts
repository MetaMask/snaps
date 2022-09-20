import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import { transactionInsightEndowmentBuilder } from './transaction-insight';
import {
  keyringEndowmentBuilder,
  keyringCaveatSpecifications,
} from './keyring';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
  [transactionInsightEndowmentBuilder.targetKey]:
    transactionInsightEndowmentBuilder,
  [keyringEndowmentBuilder.targetKey]: keyringEndowmentBuilder,
} as const;

export const endowmentCaveatSpecifications = {
  ...keyringCaveatSpecifications,
};

export * from './enum';
