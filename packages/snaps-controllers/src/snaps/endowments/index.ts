import type { PermissionConstraint } from '@metamask/permission-controller';
import { HandlerType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

import {
  cronjobCaveatSpecifications,
  cronjobEndowmentBuilder,
  getCronjobCaveatMapper,
} from './cronjob';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';
import { homePageEndowmentBuilder } from './home-page';
import {
  getKeyringCaveatMapper,
  keyringCaveatSpecifications,
  keyringEndowmentBuilder,
} from './keyring';
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
  getSignatureInsightCaveatMapper,
  signatureInsightCaveatSpecifications,
  signatureInsightEndowmentBuilder,
} from './signature-insight';
import {
  getTransactionInsightCaveatMapper,
  transactionInsightCaveatSpecifications,
  transactionInsightEndowmentBuilder,
} from './transaction-insight';
import { userInputEndowmentBuilder } from './user-input';
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
  [keyringEndowmentBuilder.targetName]: keyringEndowmentBuilder,
  [homePageEndowmentBuilder.targetName]: homePageEndowmentBuilder,
  [signatureInsightEndowmentBuilder.targetName]:
    signatureInsightEndowmentBuilder,
  [userInputEndowmentBuilder.targetName]: userInputEndowmentBuilder,
} as const;

export const endowmentCaveatSpecifications = {
  ...cronjobCaveatSpecifications,
  ...transactionInsightCaveatSpecifications,
  ...rpcCaveatSpecifications,
  ...nameLookupCaveatSpecifications,
  ...keyringCaveatSpecifications,
  ...signatureInsightCaveatSpecifications,
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
  [keyringEndowmentBuilder.targetName]: getKeyringCaveatMapper,
  [signatureInsightEndowmentBuilder.targetName]:
    getSignatureInsightCaveatMapper,
};

export const handlerEndowments: Record<HandlerType, string> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
  [HandlerType.OnNameLookup]: nameLookupEndowmentBuilder.targetName,
  [HandlerType.OnInstall]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnUpdate]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnKeyringRequest]: keyringEndowmentBuilder.targetName,
  [HandlerType.OnHomePage]: homePageEndowmentBuilder.targetName,
  [HandlerType.OnSignature]: signatureInsightEndowmentBuilder.targetName,
  [HandlerType.OnUserInput]: userInputEndowmentBuilder.targetName,
};

export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getSignatureOriginCaveat } from './signature-insight';
export { getTransactionOriginCaveat } from './transaction-insight';
export { getChainIdsCaveat } from './name-lookup';
export { getKeyringCaveatOrigins } from './keyring';
