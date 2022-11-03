import { PermissionConstraint } from '@metamask/permission-controller';
import { Json } from '@metamask/utils';

import {
  cronjobCaveatSpecifications,
  cronjobEndowmentBuilder,
  getCronjobCaveatMapper,
} from './cronjob';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';
import {
  keyringEndowmentBuilder,
  keyringCaveatSpecifications,
  getKeyringCaveatMapper,
} from './keyring';
import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import {
  getTransactionInsightCaveatMapper,
  transactionInsightCaveatSpecifications,
  transactionInsightEndowmentBuilder,
} from './transaction-insight';
import {
  getRpcCaveatMapper,
  rpcCaveatSpecifications,
  rpcEndowmentBuilder,
} from './rpc';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
  [transactionInsightEndowmentBuilder.targetKey]:
    transactionInsightEndowmentBuilder,
  [keyringEndowmentBuilder.targetKey]: keyringEndowmentBuilder,
  [cronjobEndowmentBuilder.targetKey]: cronjobEndowmentBuilder,
  [ethereumProviderEndowmentBuilder.targetKey]:
    ethereumProviderEndowmentBuilder,
  [rpcEndowmentBuilder.targetKey]: rpcEndowmentBuilder,
} as const;

export const endowmentCaveatSpecifications = {
  ...keyringCaveatSpecifications,
  ...cronjobCaveatSpecifications,
  ...transactionInsightCaveatSpecifications,
  ...rpcCaveatSpecifications,
};

export const endowmentCaveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [keyringEndowmentBuilder.targetKey]: getKeyringCaveatMapper,
  [cronjobEndowmentBuilder.targetKey]: getCronjobCaveatMapper,
  [transactionInsightEndowmentBuilder.targetKey]:
    getTransactionInsightCaveatMapper,
  [rpcEndowmentBuilder.targetKey]: getRpcCaveatMapper,
};

export * from './enum';
