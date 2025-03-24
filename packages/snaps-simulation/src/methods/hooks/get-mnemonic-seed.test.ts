import { TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES } from '@metamask/snaps-utils/test-utils';

import { getGetMnemonicSeedImplementation } from './get-mnemonic-seed';
import { DEFAULT_ALTERNATIVE_SRP } from '../../constants';

describe('getGetMnemonicSeedImplementation', () => {
  const alternativeSeedBytes = new Uint8Array([
    94, 176, 11, 189, 220, 240, 105, 8, 72, 137, 168, 171, 145, 85, 86, 129,
    101, 245, 196, 83, 204, 184, 94, 112, 129, 26, 174, 214, 246, 218, 95, 193,
    154, 90, 196, 11, 56, 156, 211, 112, 208, 134, 32, 109, 236, 138, 166, 196,
    61, 174, 166, 105, 15, 32, 173, 61, 141, 72, 178, 210, 206, 158, 56, 228,
  ]);

  it('returns the default mnemonic seed', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    expect(await getMnemonicSeed()).toStrictEqual(
      TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
    );

    expect(await getMnemonicSeed('default')).toStrictEqual(
      TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
    );
  });

  it('returns the seed of the provided default mnemonic phrase', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation(
      DEFAULT_ALTERNATIVE_SRP,
    );
    expect(await getMnemonicSeed()).toStrictEqual(alternativeSeedBytes);

    expect(await getMnemonicSeed('default')).toStrictEqual(
      alternativeSeedBytes,
    );
  });

  it('returns the alternative mnemonic seed', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    expect(await getMnemonicSeed('alternative')).toStrictEqual(
      alternativeSeedBytes,
    );
  });

  it('throws an error for an unknown entropy source', async () => {
    const getMnemonicSeed = getGetMnemonicSeedImplementation();
    await expect(getMnemonicSeed('unknown')).rejects.toThrow(
      'Entropy source with ID "unknown" not found.',
    );
  });
});
