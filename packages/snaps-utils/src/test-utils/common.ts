// TODO: Import from root.
import { mnemonicPhraseToBytes } from '@metamask/key-tree/dist/utils';
import { SemVerVersion } from '@metamask/utils';

export const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

export const TEST_SECRET_RECOVERY_PHRASE_BYTES = mnemonicPhraseToBytes(
  TEST_SECRET_RECOVERY_PHRASE,
);

/**
 * Tens/hundreds legacy tests use creation utils.
 *
 * Updating them to use proper type casting is unfeasible at this time.
 * We use this function to make creation utils backwards compatible,
 * until we're ready to update tests.
 */
export type MakeSemVer<T> = {
  [K in keyof T]: K extends 'version' ? SemVerVersion | string : T[K];
};
