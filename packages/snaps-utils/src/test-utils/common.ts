// TODO: Import from root.
import { hexToBytes, SemVerVersion } from '@metamask/utils';

export const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

// `mnemonicPhraseToBytes(TEST_SECRET_RECOVERY_PHRASE)`.
export const TEST_SECRET_RECOVERY_PHRASE_BYTES = hexToBytes(
  '0xfc06fc06fc06fc06fc06fc06fc06fc06fc06fc06fc068f00',
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
