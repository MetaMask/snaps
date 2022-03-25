/**
 * Global JavaScript APIs exposed by default to all snaps.
 */
export const DEFAULT_ENDOWMENTS: ReadonlySet<string> = new Set([
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
]);
