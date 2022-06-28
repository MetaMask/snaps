import { rootRealmGlobal } from '../globalObject';

const createCrypto = () => {
  if ('crypto' in rootRealmGlobal && 'SubtleCrypto' in rootRealmGlobal) {
    return {
      crypto: rootRealmGlobal.crypto,
      SubtleCrypto: rootRealmGlobal.SubtleCrypto,
    };
  }
  /* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, node/global-require */
  const crypto = require('crypto').webcrypto;
  return { crypto, SubtleCrypto: crypto.subtle } as const;
};

const endowmentModule = {
  names: ['crypto', 'SubtleCrypto'] as const,
  factory: createCrypto,
};
export default endowmentModule;
