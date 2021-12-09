// We can't do "declare global" in this file without this, or else we get the
// TS2669 error.
// Kudos to: https://stackoverflow.com/a/59499895
export {};

type SnapsCliGlobals = {
  snaps: {
    verboseErrors?: boolean;
    suppressWarnings?: boolean;
    isWatching?: boolean;
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-definitions
    interface Global extends SnapsCliGlobals {}
  }
}
