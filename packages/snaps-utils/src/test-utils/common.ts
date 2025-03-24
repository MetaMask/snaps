import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import type { SemVerVersion } from '@metamask/utils';

export const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

export const TEST_SECRET_RECOVERY_PHRASE_BYTES = mnemonicPhraseToBytes(
  TEST_SECRET_RECOVERY_PHRASE,
);

// await mnemonicToSeed('test test test test test test test test test test test ball')
export const TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES = new Uint8Array([
  44, 232, 45, 62, 149, 146, 73, 117, 90, 217, 78, 33, 68, 145, 185, 177, 102,
  61, 41, 58, 21, 196, 248, 21, 155, 72, 140, 191, 191, 66, 144, 46, 47, 188,
  165, 16, 149, 48, 252, 179, 255, 31, 120, 228, 174, 203, 27, 194, 102, 9, 173,
  1, 47, 174, 216, 184, 227, 85, 112, 105, 241, 209, 73, 65,
]);

/**
 * Tens/hundreds legacy tests use creation utils.
 *
 * Updating them to use proper type casting is unfeasible at this time.
 * We use this function to make creation utils backwards compatible,
 * until we're ready to update tests.
 */
export type MakeSemVer<Type> = {
  [Key in keyof Type]: Key extends 'version'
    ? SemVerVersion | string
    : Type[Key];
};
