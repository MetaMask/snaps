import { ENTROPY_VECTORS } from './__fixtures__';
import { deriveEntropy } from './entropy';

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
        }),
      ).toStrictEqual(entropy);
    },
  );
});
