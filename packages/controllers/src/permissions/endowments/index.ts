import { networkAccessEndowmentBuilder } from './network-access';

export const builders = {
  [networkAccessEndowmentBuilder.targetKey]: networkAccessEndowmentBuilder,
} as const;
