declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      SNAPS_TEST: boolean | string;
    }
  }
}

/**
 * Returns true if the current build is a test build.
 *
 * @returns True if the current build is a test build. Otherwise, false.
 */
export function isTestBuild() {
  return process.env.SNAPS_TEST === true || process.env.SNAPS_TEST === 'true';
}
