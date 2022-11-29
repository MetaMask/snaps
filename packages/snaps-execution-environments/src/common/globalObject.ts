enum GlobalObjectNames {
  // The globalThis entry is incorrectly identified as shadowing the global
  // globalThis.
  /* eslint-disable @typescript-eslint/naming-convention */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  globalThis = 'globalThis',
  global = 'global',
  self = 'self',
  window = 'window',
  /* eslint-enavle @typescript-eslint/naming-convention */
}

let _rootRealmGlobal: typeof globalThis;
let _rootRealmGlobalName: string;

/* istanbul ignore next */
/* eslint-disable no-negated-condition */
if (typeof globalThis !== 'undefined') {
  _rootRealmGlobal = globalThis;
  _rootRealmGlobalName = GlobalObjectNames.globalThis;
} else if (typeof self !== 'undefined') {
  _rootRealmGlobal = self;
  _rootRealmGlobalName = GlobalObjectNames.self;
} else if (typeof window !== 'undefined') {
  _rootRealmGlobal = window;
  _rootRealmGlobalName = GlobalObjectNames.window;
} else if (typeof global !== 'undefined') {
  _rootRealmGlobal = global;
  _rootRealmGlobalName = GlobalObjectNames.global;
} else {
  throw new Error('Unknown realm type; failed to identify global object.');
}
/* eslint-enable no-negated-condition */

/**
 * A platform-agnostic alias for the root realm global object.
 */
const rootRealmGlobal = _rootRealmGlobal;

/**
 * The string literal corresponding to the name of the root realm global object.
 */
const rootRealmGlobalName = _rootRealmGlobalName;

export { rootRealmGlobal, rootRealmGlobalName };
