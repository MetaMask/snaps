/**
 * Whether the current build is a test build, i.e., it was built with the
 * `SNAPS_TEST` environment variable set to `true`.
 */
export const IS_TEST_BUILD =
  // @ts-expect-error - Webpack replaces the value of SNAPS_TEST with a boolean
  // at build time, but TypeScript doesn't know that.
  process.env.SNAPS_TEST === true || process.env.SNAPS_TEST === 'true';
