// We can't do "declare global" in this file without this, or else we get the
// TS2669 error.
// Kudos to: https://stackoverflow.com/a/59499895
export {};

type SnapsCliGlobals = {
  verboseErrors?: boolean;
  suppressWarnings?: boolean;
  isWatching?: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var snaps: SnapsCliGlobals;
}
