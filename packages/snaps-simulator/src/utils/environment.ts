/**
 * Returns true if the current build is a test build.
 *
 * @returns True if the current build is a test build. Otherwise, false.
 */
export function isTestBuild() {
  // @ts-expect-error - Webpack replaces the value of SNAPS_TEST with a boolean
  // at build time, but TypeScript doesn't know that.
  return process.env.SNAPS_TEST === true || process.env.SNAPS_TEST === 'true';
}
