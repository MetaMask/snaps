import type { PermissionConstraint } from '@metamask/permission-controller';
import { HandlerType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

import {
  cronjobCaveatSpecifications,
  cronjobEndowmentBuilder,
  getCronjobCaveatMapper,
} from './cronjob';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';
import { lifecycleHooksEndowmentBuilder } from './lifecycle-hooks';
import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import {
  getRpcCaveatMapper,
  rpcCaveatSpecifications,
  rpcEndowmentBuilder,
} from './rpc';
import {
  getTransactionInsightCaveatMapper,
  transactionInsightCaveatSpecifications,
  transactionInsightEndowmentBuilder,
} from './transaction-insight';
import { webAssemblyEndowmentBuilder } from './web-assembly';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetName]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetName]: longRunningEndowmentBuilder,
  [transactionInsightEndowmentBuilder.targetName]:
    transactionInsightEndowmentBuilder,
  [cronjobEndowmentBuilder.targetName]: cronjobEndowmentBuilder,
  [ethereumProviderEndowmentBuilder.targetName]:
    ethereumProviderEndowmentBuilder,
  [rpcEndowmentBuilder.targetName]: rpcEndowmentBuilder,
  [webAssemblyEndowmentBuilder.targetName]: webAssemblyEndowmentBuilder,
  [lifecycleHooksEndowmentBuilder.targetName]: lifecycleHooksEndowmentBuilder,
} as const;

export const endowmentCaveatSpecifications = {
  ...cronjobCaveatSpecifications,
  ...transactionInsightCaveatSpecifications,
  ...rpcCaveatSpecifications,
};

export const endowmentCaveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [cronjobEndowmentBuilder.targetName]: getCronjobCaveatMapper,
  [transactionInsightEndowmentBuilder.targetName]:
    getTransactionInsightCaveatMapper,
  [rpcEndowmentBuilder.targetName]: getRpcCaveatMapper,
};

export const handlerEndowments: Record<HandlerType, string> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
  [HandlerType.OnInstall]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnUpdate]: lifecycleHooksEndowmentBuilder.targetName,
};

export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getTransactionOriginCaveat } from './transaction-insight';
