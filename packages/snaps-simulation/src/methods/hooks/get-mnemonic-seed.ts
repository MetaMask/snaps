import { mnemonicToSeed } from '@metamask/key-tree';

import { DEFAULT_ALTERNATIVE_SRP, DEFAULT_SRP } from '../../constants';

/**
 * Get the implementation of the `getMnemonicSeed` method.
 *
 * @param defaultSecretRecoveryPhrase - The default secret recovery phrase to
 * use.
 * @returns The implementation of the `getMnemonicSeed` method.
 */
export function getGetMnemonicSeedImplementation(
  defaultSecretRecoveryPhrase: string = DEFAULT_SRP,
) {
  return async (source?: string | undefined): Promise<Uint8Array> => {
    if (!source) {
      return mnemonicToSeed(defaultSecretRecoveryPhrase);
    }

    switch (source) {
      case 'default':
        return mnemonicToSeed(defaultSecretRecoveryPhrase);
      case 'alternative':
        return mnemonicToSeed(DEFAULT_ALTERNATIVE_SRP);
      default:
        throw new Error(`Entropy source with ID "${source}" not found.`);
    }
  };
}
