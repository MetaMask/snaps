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
import {
  getNameLookupCaveatMapper,
  nameLookupCaveatSpecifications,
  nameLookupEndowmentBuilder,
} from './name-lookup';
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
  [transactionInsightEndowmentBuilder.targetName]:
    transactionInsightEndowmentBuilder,
  [cronjobEndowmentBuilder.targetName]: cronjobEndowmentBuilder,
  [ethereumProviderEndowmentBuilder.targetName]:
    ethereumProviderEndowmentBuilder,
  [rpcEndowmentBuilder.targetName]: rpcEndowmentBuilder,
  [webAssemblyEndowmentBuilder.targetName]: webAssemblyEndowmentBuilder,
  [nameLookupEndowmentBuilder.targetName]: nameLookupEndowmentBuilder,
  [lifecycleHooksEndowmentBuilder.targetName]: lifecycleHooksEndowmentBuilder,
} as const;

export const endowmentCaveatSpecifications = {
  ...cronjobCaveatSpecifications,
  ...transactionInsightCaveatSpecifications,
  ...rpcCaveatSpecifications,
  ...nameLookupCaveatSpecifications,
};

export const endowmentCaveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [cronjobEndowmentBuilder.targetName]: getCronjobCaveatMapper,
  [transactionInsightEndowmentBuilder.targetName]:
    getTransactionInsightCaveatMapper,
  [rpcEndowmentBuilder.targetName]: getRpcCaveatMapper,
  [nameLookupEndowmentBuilder.targetName]: getNameLookupCaveatMapper,
};

export const handlerEndowments: Record<HandlerType, string> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
  [HandlerType.OnNameLookup]: nameLookupEndowmentBuilder.targetName,
  [HandlerType.OnInstall]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnUpdate]: lifecycleHooksEndowmentBuilder.targetName,
};

export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getTransactionOriginCaveat } from './transaction-insight';
export { getChainIdsCaveat } from './name-lookup';
