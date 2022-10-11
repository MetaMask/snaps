/**
 * Global JavaScript APIs exposed by default to all snaps.
 */
export const DEFAULT_ENDOWMENTS: readonly string[] = Object.freeze([
  'atob',
  'btoa',
  'BigInt',
  'Buffer', // The Node.js Buffer. Polyfilled in browser environments.
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
  'WebAssembly',
  'setInterval',
  'clearInterval',
  // Used by fetch, but also as API for some packages that don't do network connections
  // https://github.com/MetaMask/snaps-monorepo/issues/662
  // https://github.com/MetaMask/snaps-monorepo/discussions/678
  'AbortController',
  'AbortSignal',
]);
