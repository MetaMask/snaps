import { assert } from '@metamask/utils';

import { rootRealmGlobal } from '../globalObject';

export const createCrypto = () => {
  assert(
    rootRealmGlobal.crypto,
    'Crypto endowment requires `globalThis.crypto` to be defined.',
  );

  assert(
    rootRealmGlobal.SubtleCrypto,
    'Crypto endowment requires `globalThis.SubtleCrypto` to be defined.',
  );

  return {
    crypto: harden(rootRealmGlobal.crypto),
    SubtleCrypto: harden(rootRealmGlobal.SubtleCrypto),
  };
};

const endowmentModule = {
  names: ['crypto', 'SubtleCrypto'] as const,
  factory: createCrypto,
};
export default endowmentModule;
