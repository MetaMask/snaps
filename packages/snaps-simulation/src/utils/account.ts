import type { SnapId } from '@metamask/snaps-sdk';
import type { SimulationAccount } from 'src/options';

export const addSnapMetadataToAccount = (
  account: SimulationAccount,
  snapId: SnapId,
) => {
  if (!account.owned) {
    return {
      ...account,
      metadata: {},
    };
  }

  return {
    ...account,
    metadata: {
      snap: {
        id: snapId,
      },
    },
  };
};
