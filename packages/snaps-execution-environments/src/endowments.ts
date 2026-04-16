/**
 * Public endowment factory exports for use outside the Snaps ecosystem.
 *
 * **Prerequisite**: These factories call the SES `harden()` global internally.
 * The consuming environment must have loaded SES and called `lockdown()` before
 * invoking any factory function.
 *
 * Each module provides a `names` array and a `factory` function. Call
 * `factory()` to obtain hardened endowment values (and an optional
 * `teardownFunction` for stateful endowments that manage resources).
 *
 * @example
 * ```ts
 * import { timeout, date } from '@metamask/snaps-execution-environments/endowments';
 *
 * const timers = timeout.factory();
 * // { setTimeout, clearTimeout, teardownFunction }
 *
 * const dateEndowment = date.factory();
 * // { Date } (with attenuated Date.now)
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
export { default as consoleEndowment } from './common/endowments/console';
export { default as network } from './common/endowments/network';

// Consolidated factory builder and types
export { default as buildCommonEndowments } from './common/endowments/commonEndowmentFactory';
export type {
  NotifyFunction,
  EndowmentFactoryOptions,
  EndowmentFactoryResult,
  EndowmentFactory,
} from './common/endowments/commonEndowmentFactory';
