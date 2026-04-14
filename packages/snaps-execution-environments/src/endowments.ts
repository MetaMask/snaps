/**
 * Public endowment factory exports for use outside the Snaps ecosystem.
 *
 * Each module provides a `names` array and a `factory` function. Call
 * `factory()` to obtain hardened endowment values (and an optional
 * `teardownFunction` for timer-based endowments).
 *
 * @example
 * ```ts
 * import { timeout, date } from '@metamask/snaps-execution-environments/endowments';
 *
 * const timers = timeout.factory();
 * // { setTimeout, clearTimeout, teardownFunction }
 *
 * const dateEndowment = date.factory();
 * // { Date } (with noise-added Date.now)
 * ```
 *
 * @module endowments
 */

// Individual endowment factory modules
export { default as timeout } from './common/endowments/timeout';
export { default as interval } from './common/endowments/interval';
export { default as date } from './common/endowments/date';
export { default as textEncoder } from './common/endowments/textEncoder';
export { default as textDecoder } from './common/endowments/textDecoder';
export { default as crypto } from './common/endowments/crypto';
export { default as math } from './common/endowments/math';
