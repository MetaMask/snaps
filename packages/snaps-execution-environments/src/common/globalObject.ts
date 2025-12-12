// @ts-expect-error No types.
import { endowmentsToolkit } from 'lavamoat-core/src/endowmentsToolkit'

enum GlobalObjectNames {
  // The globalThis entry is incorrectly identified as shadowing the global
  // globalThis.
  /* eslint-disable @typescript-eslint/naming-convention */
  globalThis = 'globalThis',
  global = 'global',
  self = 'self',
  window = 'window',
  /* eslint-enable @typescript-eslint/naming-convention */
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
  // eslint-disable-next-line no-restricted-globals
} else if (typeof global !== 'undefined') {
  // eslint-disable-next-line no-restricted-globals
  _rootRealmGlobal = global;
  _rootRealmGlobalName = GlobalObjectNames.global;
} else {
  throw new Error('Unknown realm type; failed to identify global object.');
}
/* eslint-enable no-negated-condition */

const { copyWrappedGlobals } = endowmentsToolkit();

/**
 * A platform-agnostic alias for the root realm global object.
 */
const rootRealmGlobal = copyWrappedGlobals(_rootRealmGlobal, {}, ['globalThis', 'global', 'self', 'window']);

/**
 * The string literal corresponding to the name of the root realm global object.
 */
const rootRealmGlobalName = _rootRealmGlobalName;

export { rootRealmGlobal, rootRealmGlobalName };
