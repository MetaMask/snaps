import { mnemonicPhraseToBytes } from '@metamask/key-tree';

import { getGetMnemonicImplementation } from './get-mnemonic';
import {
  DEFAULT_ALTERNATIVE_SRP,
  DEFAULT_SRP,
} from '@metamask/snaps-simulation';

describe('getGetMnemonicImplementation', () => {
  it('returns the default mnemonic phrase', async () => {
    const getMnemonic = getGetMnemonicImplementation();
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );

    expect(await getMnemonic('default')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );
  });

  it('returns the provided default mnemonic phrase', async () => {
    const getMnemonic = getGetMnemonicImplementation(DEFAULT_ALTERNATIVE_SRP);
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );

    expect(await getMnemonic('default')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );
  });

  it('returns the alternative mnemonic phrase', async () => {
    const getMnemonic = getGetMnemonicImplementation();
    expect(await getMnemonic('alternative')).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
    );
  });

  it('throws an error for an unknown entropy source', async () => {
    const getMnemonic = getGetMnemonicImplementation();
    await expect(getMnemonic('unknown')).rejects.toThrow(
      'Unknown entropy source: "unknown".',
    );
  });
});
