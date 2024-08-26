import { rootRealmGlobal } from '../globalObject';

export const createCrypto = () => {
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
