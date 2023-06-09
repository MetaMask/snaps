import { PermissionConstraint } from '@metamask/permission-controller';
import { HandlerType } from '@metamask/snaps-utils';
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
import { nameLookupEndowmentBuilder } from './name-lookup';
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
  [keyringEndowmentBuilder.targetName]: keyringEndowmentBuilder,
  [cronjobEndowmentBuilder.targetName]: cronjobEndowmentBuilder,
  [ethereumProviderEndowmentBuilder.targetName]:
    ethereumProviderEndowmentBuilder,
  [rpcEndowmentBuilder.targetName]: rpcEndowmentBuilder,
  [webAssemblyEndowmentBuilder.targetName]: webAssemblyEndowmentBuilder,
  [nameLookupEndowmentBuilder.targetName]: nameLookupEndowmentBuilder,
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
  [keyringEndowmentBuilder.targetName]: getKeyringCaveatMapper,
  [cronjobEndowmentBuilder.targetName]: getCronjobCaveatMapper,
  [transactionInsightEndowmentBuilder.targetName]:
    getTransactionInsightCaveatMapper,
  [rpcEndowmentBuilder.targetName]: getRpcCaveatMapper,
};

export const handlerEndowments: Record<HandlerType, string> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
  [HandlerType.SnapKeyring]: keyringEndowmentBuilder.targetName,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
  [HandlerType.OnNameLookup]: nameLookupEndowmentBuilder.targetName,
};

export * from './enum';
export { getTransactionOriginCaveat } from './transaction-insight';
