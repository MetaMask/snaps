import { HandlerType } from '@metamask/snaps-utils';
import { cronjobCaveatSpecifications, cronjobEndowmentBuilder, getCronjobCaveatMapper } from './cronjob';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';
import { getKeyringCaveatMapper, keyringCaveatSpecifications, keyringEndowmentBuilder } from './keyring';
import { lifecycleHooksEndowmentBuilder } from './lifecycle-hooks';
import { getNameLookupCaveatMapper, nameLookupCaveatSpecifications, nameLookupEndowmentBuilder } from './name-lookup';
import { networkAccessEndowmentBuilder } from './network-access';
import { getRpcCaveatMapper, rpcCaveatSpecifications, rpcEndowmentBuilder } from './rpc';
import { getTransactionInsightCaveatMapper, transactionInsightCaveatSpecifications, transactionInsightEndowmentBuilder } from './transaction-insight';
import { webAssemblyEndowmentBuilder } from './web-assembly';
export const endowmentPermissionBuilders = {
    [networkAccessEndowmentBuilder.targetName]: networkAccessEndowmentBuilder,
    [transactionInsightEndowmentBuilder.targetName]: transactionInsightEndowmentBuilder,
    [cronjobEndowmentBuilder.targetName]: cronjobEndowmentBuilder,
    [ethereumProviderEndowmentBuilder.targetName]: ethereumProviderEndowmentBuilder,
    [rpcEndowmentBuilder.targetName]: rpcEndowmentBuilder,
    [webAssemblyEndowmentBuilder.targetName]: webAssemblyEndowmentBuilder,
    [nameLookupEndowmentBuilder.targetName]: nameLookupEndowmentBuilder,
    [lifecycleHooksEndowmentBuilder.targetName]: lifecycleHooksEndowmentBuilder,
    [keyringEndowmentBuilder.targetName]: keyringEndowmentBuilder
};
export const endowmentCaveatSpecifications = {
    ...cronjobCaveatSpecifications,
    ...transactionInsightCaveatSpecifications,
    ...rpcCaveatSpecifications,
    ...nameLookupCaveatSpecifications,
    ...keyringCaveatSpecifications
};
export const endowmentCaveatMappers = {
    [cronjobEndowmentBuilder.targetName]: getCronjobCaveatMapper,
    [transactionInsightEndowmentBuilder.targetName]: getTransactionInsightCaveatMapper,
    [rpcEndowmentBuilder.targetName]: getRpcCaveatMapper,
    [nameLookupEndowmentBuilder.targetName]: getNameLookupCaveatMapper,
    [keyringEndowmentBuilder.targetName]: getKeyringCaveatMapper
};
export const handlerEndowments = {
    [HandlerType.OnRpcRequest]: rpcEndowmentBuilder.targetName,
    [HandlerType.OnTransaction]: transactionInsightEndowmentBuilder.targetName,
    [HandlerType.OnCronjob]: cronjobEndowmentBuilder.targetName,
    [HandlerType.OnNameLookup]: nameLookupEndowmentBuilder.targetName,
    [HandlerType.OnInstall]: lifecycleHooksEndowmentBuilder.targetName,
    [HandlerType.OnUpdate]: lifecycleHooksEndowmentBuilder.targetName,
    [HandlerType.OnKeyringRequest]: keyringEndowmentBuilder.targetName
};
export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getTransactionOriginCaveat } from './transaction-insight';
export { getChainIdsCaveat } from './name-lookup';
export { getKeyringCaveatOrigins } from './keyring';

//# sourceMappingURL=index.js.map