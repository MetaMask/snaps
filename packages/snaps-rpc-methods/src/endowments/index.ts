import type { PermissionConstraint } from '@metamask/permission-controller';
import { HandlerType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

import {
  createMaxRequestTimeMapper,
  getMaxRequestTimeCaveatMapper,
  maxRequestTimeCaveatSpecifications,
} from './caveats';
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
} as const;

export const endowmentCaveatSpecifications = {
  ...cronjobCaveatSpecifications,
  ...transactionInsightCaveatSpecifications,
  ...rpcCaveatSpecifications,
  ...nameLookupCaveatSpecifications,
  ...keyringCaveatSpecifications,
  ...signatureInsightCaveatSpecifications,
  ...maxRequestTimeCaveatSpecifications,
};

export const endowmentCaveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [cronjobEndowmentBuilder.targetName]: createMaxRequestTimeMapper(
    getCronjobCaveatMapper,
  ),
  [transactionInsightEndowmentBuilder.targetName]: createMaxRequestTimeMapper(
    getTransactionInsightCaveatMapper,
  ),
  [rpcEndowmentBuilder.targetName]:
    createMaxRequestTimeMapper(getRpcCaveatMapper),
  [nameLookupEndowmentBuilder.targetName]: createMaxRequestTimeMapper(
    getNameLookupCaveatMapper,
  ),
  [keyringEndowmentBuilder.targetName]: createMaxRequestTimeMapper(
    getKeyringCaveatMapper,
  ),
  [signatureInsightEndowmentBuilder.targetName]: createMaxRequestTimeMapper(
    getSignatureInsightCaveatMapper,
  ),
  [lifecycleHooksEndowmentBuilder.targetName]: getMaxRequestTimeCaveatMapper,
  [homePageEndowmentBuilder.targetName]: getMaxRequestTimeCaveatMapper,
};

// We allow null because a permitted handler does not have an endowment
export const handlerEndowments: Record<HandlerType, string | null> = {
  [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
  [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
  [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
  [HandlerType.OnNameLookup]: nameLookupEndowmentBuilder.targetName,
  [HandlerType.OnInstall]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnUpdate]: lifecycleHooksEndowmentBuilder.targetName,
  [HandlerType.OnKeyringRequest]: keyringEndowmentBuilder.targetName,
  [HandlerType.OnHomePage]: homePageEndowmentBuilder.targetName,
  [HandlerType.OnSignature]: signatureInsightEndowmentBuilder.targetName,
  [HandlerType.OnUserInput]: null,
};

export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getSignatureOriginCaveat } from './signature-insight';
export { getTransactionOriginCaveat } from './transaction-insight';
export { getChainIdsCaveat, getLookupMatchersCaveat } from './name-lookup';
export { getKeyringCaveatOrigins } from './keyring';
export { getMaxRequestTimeCaveat } from './caveats';
export { getCronjobCaveatJobs } from './cronjob';
