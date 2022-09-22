import { PermissionConstraint } from '@metamask/controllers';
import { Json } from '@metamask/utils';
import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';
import { transactionInsightEndowmentBuilder } from './transaction-insight';
import {
  keyringEndowmentBuilder,
  keyringCaveatSpecifications,
  getKeyringCaveatMapper,
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

export const endowmentCaveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [keyringEndowmentBuilder.targetKey]: getKeyringCaveatMapper,
};

export * from './enum';
