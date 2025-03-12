import { mnemonicPhraseToBytes } from '@metamask/key-tree';

import { getGetMnemonicSeedImplementation } from './get-mnemonic-seed';
import { DEFAULT_ALTERNATIVE_SRP, DEFAULT_SRP } from '../../constants';

describe('getGetMnemonicSeedImplementation', () => {
  it('returns the default mnemonic seed', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    expect(await getMnemonicSeed()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );

    expect(await getMnemonicSeed('default')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );
  });

  it('returns the seed of the provided default mnemonic phrase', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation(
      DEFAULT_ALTERNATIVE_SRP,
    );
    expect(await getMnemonicSeed()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );

    expect(await getMnemonicSeed('default')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );
  });

  it('returns the alternative mnemonic seed', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    expect(await getMnemonicSeed('alternative')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );
  });

  it('throws an error for an unknown entropy source', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    await expect(getMnemonicSeed('unknown')).rejects.toThrow(
      'Entropy source with ID "unknown" not found.',
    );
  });
});
