import type { SnapId } from '@metamask/snaps-sdk';
import type { Json } from '@metamask/utils';

/**
 * Copy of the original type from
 * https://github.com/MetaMask/accounts/blob/main/packages/keyring-internal-api/src/types.ts
 */
export type InternalAccount = {
  id: string;
  type: string;
  address: string;
  options: Record<string, Json>;
  methods: string[];
  metadata: {
    name: string;
    snap?: { id: SnapId; enabled: boolean; name: string };
  };
};
