import { longRunningEndowmentBuilder } from './long-running';
import { networkAccessEndowmentBuilder } from './network-access';

export const endowmentPermissionBuilders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
  [longRunningEndowmentBuilder.targetKey]: longRunningEndowmentBuilder,
} as const;
