import { mnemonicPhraseToBytes } from '@metamask/key-tree';

import { DEFAULT_ALTERNATIVE_SRP, DEFAULT_SRP } from '../../constants';

/**
 * Get the implementation of the `getMnemonic` method.
 *
 * @param defaultSecretRecoveryPhrase - The default secret recovery phrase to
 * use.
 * @returns The implementation of the `getMnemonic` method.
 */
export function getGetMnemonicImplementation(
  defaultSecretRecoveryPhrase: string = DEFAULT_SRP,
) {
  return async (source?: string | undefined): Promise<Uint8Array> => {
    if (!source) {
      return mnemonicPhraseToBytes(defaultSecretRecoveryPhrase);
    }

    switch (source) {
      case 'default':
        return mnemonicPhraseToBytes(defaultSecretRecoveryPhrase);
      case 'alternative':
        return mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP);
      default:
        throw new Error(`Entropy source with ID "${source}" not found.`);
    }
  };
}
