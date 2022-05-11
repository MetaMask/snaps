import { networkAccessEndowmentBuilder } from './network-access';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
} as const;
