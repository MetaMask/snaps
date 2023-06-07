/**
 * Returns true if the current build is a test build.
 *
 * @returns True if the current build is a test build. Otherwise, false.
 */
export function isTestBuild() {
  return process.env.SNAPS_TEST === 'true';
}
