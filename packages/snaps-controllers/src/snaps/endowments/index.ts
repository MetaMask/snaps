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
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
  [transactionInsightEndowmentBuilder.targetKey]:
    transactionInsightEndowmentBuilder,
  [keyringEndowmentBuilder.targetKey]: keyringEndowmentBuilder,
  [cronjobEndowmentBuilder.targetKey]: cronjobEndowmentBuilder,
  [ethereumProviderEndowmentBuilder.targetKey]:
    ethereumProviderEndowmentBuilder,
  [rpcEndowmentBuilder.targetKey]: rpcEndowmentBuilder,
  [webAssemblyEndowmentBuilder.targetKey]: webAssemblyEndowmentBuilder,
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

export const handlerEndowments: Record<HandlerType, string> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetKey,
  [HandlerType.SnapKeyring]: keyringEndowmentBuilder.targetKey,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetKey,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetKey,
};

export * from './enum';
export { getTransactionOriginCaveat } from './transaction-insight';
