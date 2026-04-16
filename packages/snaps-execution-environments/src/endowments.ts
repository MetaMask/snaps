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

import type {
  EndowmentFactoryOptions,
  EndowmentFactoryResult,
} from './common/endowments/commonEndowmentFactory';
import consoleEndowmentModule from './common/endowments/console';
import networkModule from './common/endowments/network';

// Individual endowment factory modules with no required options
export { default as timeout } from './common/endowments/timeout';
export { default as interval } from './common/endowments/interval';
export { default as date } from './common/endowments/date';
export { default as textEncoder } from './common/endowments/textEncoder';
export { default as textDecoder } from './common/endowments/textDecoder';
export { default as crypto } from './common/endowments/crypto';
export { default as math } from './common/endowments/math';

/**
 * Options required by the console endowment factory.
 */
export type ConsoleEndowmentOptions = Required<
  Pick<EndowmentFactoryOptions, 'sourceLabel'>
>;

/**
 * Options required by the network endowment factory.
 */
export type NetworkEndowmentOptions = Required<
  Pick<EndowmentFactoryOptions, 'notify'>
>;

/**
 * The console endowment factory. Produces an attenuated `console` object that
 * prefixes output with the provided source label.
 */
export const consoleEndowment: {
  readonly names: readonly ['console'];
  factory: (options: ConsoleEndowmentOptions) => EndowmentFactoryResult;
} = consoleEndowmentModule;

/**
 * The network endowment factory. Produces a wrapped `fetch` function and
 * related types with teardown support.
 */
export const network: {
  readonly names: readonly ['fetch', 'Request', 'Headers', 'Response'];
  factory: (options: NetworkEndowmentOptions) => EndowmentFactoryResult;
} = networkModule;

// Consolidated factory builder and types
export { default as buildCommonEndowments } from './common/endowments/commonEndowmentFactory';
export type {
  NotifyFunction,
  EndowmentFactoryOptions,
  EndowmentFactoryResult,
  EndowmentFactory,
} from './common/endowments/commonEndowmentFactory';
