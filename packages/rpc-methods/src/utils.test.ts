import { SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';
import { TEST_SECRET_RECOVERY_PHRASE_BYTES } from '@metamask/snaps-utils/test-utils';

import { ENTROPY_VECTORS } from './__fixtures__';
import { deriveEntropy } from './utils';

describe('deriveEntropy', () => {
  it.each(ENTROPY_VECTORS)(
    'derives entropy from the given parameters',
    async ({ snapId, salt, entropy }) => {
      expect(
        await deriveEntropy({
          input: snapId,
          salt,
          mnemonicPhrase: TEST_SECRET_RECOVERY_PHRASE_BYTES,
          magic: SIP_6_MAGIC_VALUE,
        }),
      ).toStrictEqual(entropy);
    },
  );
});
