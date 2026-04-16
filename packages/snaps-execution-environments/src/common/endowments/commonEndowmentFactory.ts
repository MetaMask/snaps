import type { JsonRpcNotification } from '@metamask/utils';

import consoleEndowment from './console';
import crypto from './crypto';
import date from './date';
import interval from './interval';
import math from './math';
import network from './network';
import textDecoder from './textDecoder';
import textEncoder from './textEncoder';
import timeout from './timeout';
import { rootRealmGlobal } from '../globalObject';

/**
 * A function for sending JSON-RPC notifications from an endowment.
 * Used by the network endowment to signal outbound request lifecycle events.
 */
export type NotifyFunction = (
  notification: Omit<JsonRpcNotification, 'jsonrpc'>,
) => Promise<void>;

/**
 * Options passed to endowment factory functions.
 */
export type EndowmentFactoryOptions = {
  /**
   * A label identifying the source of endowment interactions (e.g., console
   * output). The caller controls the format — Snaps passes `Snap: ${snapId}`,
   * but external consumers may use any label.
   */
  sourceLabel?: string;

  /**
   * A notification callback used by endowments that perform outbound
   * operations (e.g., network `fetch`).
   */
  notify?: NotifyFunction;
};

/**
 * The object returned by an endowment factory. Contains the named endowment
 * values (keyed by name) and an optional teardown function for lifecycle
 * management.
 */
export type EndowmentFactoryResult = {
  /**
   * An optional function that performs cleanup when the execution environment
   * becomes idle. Must not render endowments unusable — only restore them to
   * their initial state, since they may be reused without reconstruction.
   */
  teardownFunction?: () => Promise<void> | void;
  [key: string]: unknown;
};

/**
 * Describes an endowment factory module. Each module exposes the names of
 * the endowments it provides and a factory function that produces them.
 */
export type EndowmentFactory = {
  names: readonly string[];
  factory: (options?: EndowmentFactoryOptions) => EndowmentFactoryResult;
};

/**
 * Describes a simple global value that should be hardened and exposed as an
 * endowment without additional attenuation.
 */
export type CommonEndowmentSpecification = {
  endowment: unknown;
  name: string;
  bind?: boolean;
};

// Array of common endowments
const commonEndowments: CommonEndowmentSpecification[] = [
  { endowment: AbortController, name: 'AbortController' },
  { endowment: AbortSignal, name: 'AbortSignal' },
  { endowment: ArrayBuffer, name: 'ArrayBuffer' },
  { endowment: atob, name: 'atob', bind: true },
  { endowment: BigInt, name: 'BigInt' },
  { endowment: BigInt64Array, name: 'BigInt64Array' },
  { endowment: BigUint64Array, name: 'BigUint64Array' },
  { endowment: btoa, name: 'btoa', bind: true },
  { endowment: DataView, name: 'DataView' },
  { endowment: Float32Array, name: 'Float32Array' },
  { endowment: Float64Array, name: 'Float64Array' },
  { endowment: Intl, name: 'Intl' },
  { endowment: Int8Array, name: 'Int8Array' },
  { endowment: Int16Array, name: 'Int16Array' },
  { endowment: Int32Array, name: 'Int32Array' },
  { endowment: globalThis.isSecureContext, name: 'isSecureContext' },
  { endowment: Uint8Array, name: 'Uint8Array' },
  { endowment: Uint8ClampedArray, name: 'Uint8ClampedArray' },
  { endowment: Uint16Array, name: 'Uint16Array' },
  { endowment: Uint32Array, name: 'Uint32Array' },
  { endowment: URL, name: 'URL' },
  { endowment: URLSearchParams, name: 'URLSearchParams' },
  { endowment: WebAssembly, name: 'WebAssembly' },
];

/**
 * Creates a consolidated collection of common endowments.
 * This function will return factories for all common endowments including
 * the additionally attenuated. All hardened with SES.
 *
 * @returns An object with common endowments.
 */
const buildCommonEndowments = (): EndowmentFactory[] => {
  const endowmentFactories: EndowmentFactory[] = [
    crypto,
    interval,
    math,
    network,
    timeout,
    textDecoder,
    textEncoder,
    date,
    consoleEndowment,
  ];

  commonEndowments.forEach((endowmentSpecification) => {
    const endowment = {
      names: [endowmentSpecification.name] as const,
      factory: () => {
        const boundEndowment =
          typeof endowmentSpecification.endowment === 'function' &&
          endowmentSpecification.bind
            ? endowmentSpecification.endowment.bind(rootRealmGlobal)
            : endowmentSpecification.endowment;
        return {
          [endowmentSpecification.name]: harden(boundEndowment),
        } as const;
      },
    };
    endowmentFactories.push(endowment);
  });

  return endowmentFactories;
};

export default buildCommonEndowments;
