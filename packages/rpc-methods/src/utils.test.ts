import { SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';

import { ENTROPY_VECTORS } from './__fixtures__';
import { deriveEntropy } from './utils';

const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

describe('deriveEntropy', () => {
  it.each(ENTROPY_VECTORS)(
    'derives entropy from the given parameters',
    async ({ snapId, salt, entropy }) => {
      expect(
        await deriveEntropy({
          input: snapId,
          salt,
          mnemonicPhrase: TEST_SECRET_RECOVERY_PHRASE,
          magic: SIP_6_MAGIC_VALUE,
        }),
      ).toStrictEqual(entropy);
    },
  );
});
