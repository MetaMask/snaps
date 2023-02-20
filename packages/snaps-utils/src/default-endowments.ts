/**
 * Global JavaScript APIs exposed by default to all snaps.
 */
export const DEFAULT_ENDOWMENTS: readonly string[] = Object.freeze([
  'atob',
  'btoa',
  'BigInt',
  'console',
  'crypto',
  'Date',
  'Math',
  'setTimeout',
  'clearTimeout',
  'SubtleCrypto',
  'TextDecoder',
  'TextEncoder',
  'URL',
  'setInterval',
  'clearInterval',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  'DataView',
  'ArrayBuffer',
  // Used by fetch, but also as API for some packages that don't do network connections
  // https://github.com/MetaMask/snaps-monorepo/issues/662
  // https://github.com/MetaMask/snaps-monorepo/discussions/678
  'AbortController',
  'AbortSignal',
]);
