import { rootRealmGlobal } from '../globalObject';

export const createCrypto = () => {
  if (
    'crypto' in rootRealmGlobal &&
    typeof rootRealmGlobal.crypto === 'object' &&
    'SubtleCrypto' in rootRealmGlobal &&
    typeof rootRealmGlobal.SubtleCrypto === 'function'
  ) {
    return {
      crypto: harden(rootRealmGlobal.crypto),
      SubtleCrypto: harden(rootRealmGlobal.SubtleCrypto),
    };
  }
  // For now, we expose the experimental webcrypto API for Node.js execution environments
  // TODO: Figure out if this is enough long-term or if we should use a polyfill.
  /* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, n/global-require */
  const crypto = require('crypto').webcrypto;
  return {
    crypto: harden(crypto),
    SubtleCrypto: harden(crypto.subtle.constructor),
  } as const;
};

const endowmentModule = {
  names: ['crypto', 'SubtleCrypto'] as const,
  factory: createCrypto,
};
export default endowmentModule;
