import { assert } from '@metamask/utils';

/**
 * Get the Snaps environment. This asserts that the environment has been
 * configured.
 *
 * @returns The Snaps environment.
 */
export function getEnvironment() {
  // `snapsEnvironment` is a global variable that is set by the Jest
  // environment.
  assert(
    snapsEnvironment,
    'Snaps environment not found. Make sure you have configured the environment correctly.',
  );

  return snapsEnvironment;
}
