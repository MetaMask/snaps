import consoleEndowment from './console';
import crypto from './crypto';
import date from './date';
import interval from './interval';
import math from './math';
import network from './network';
import textDecoder from './textDecoder';
import textEncoder from './textEncoder';
import timeout from './timeout';
import type { NotifyFunction } from '../BaseSnapExecutor';
import { rootRealmGlobal } from '../globalObject';

export type EndowmentFactoryOptions = {
  snapId?: string;
  notify?: NotifyFunction;
};

export type EndowmentFactory = {
  names: readonly string[];
  factory: (options?: EndowmentFactoryOptions) => { [key: string]: unknown };
};

export type CommonEndowmentSpecification = {
  endowment: unknown;
  name: string;
  bind?: boolean;
};

// Array of common endowments
const commonEndowments: CommonEndowmentSpecification[] = [
  { endowment: rootRealmGlobal.AbortController, name: 'AbortController' },
  { endowment: rootRealmGlobal.AbortSignal, name: 'AbortSignal' },
  { endowment: rootRealmGlobal.ArrayBuffer, name: 'ArrayBuffer' },
  { endowment: rootRealmGlobal.atob, name: 'atob', bind: true },
  { endowment: rootRealmGlobal.BigInt, name: 'BigInt' },
  { endowment: rootRealmGlobal.BigInt64Array, name: 'BigInt64Array' },
  { endowment: rootRealmGlobal.BigUint64Array, name: 'BigUint64Array' },
  { endowment: rootRealmGlobal.btoa, name: 'btoa', bind: true },
  { endowment: rootRealmGlobal.DataView, name: 'DataView' },
  { endowment: rootRealmGlobal.Float32Array, name: 'Float32Array' },
  { endowment: rootRealmGlobal.Float64Array, name: 'Float64Array' },
  { endowment: rootRealmGlobal.Intl, name: 'Intl' },
  { endowment: rootRealmGlobal.Int8Array, name: 'Int8Array' },
  { endowment: rootRealmGlobal.Int16Array, name: 'Int16Array' },
  { endowment: rootRealmGlobal.Int32Array, name: 'Int32Array' },
  { endowment: rootRealmGlobal.isSecureContext, name: 'isSecureContext' },
  { endowment: rootRealmGlobal.Uint8Array, name: 'Uint8Array' },
  { endowment: rootRealmGlobal.Uint8ClampedArray, name: 'Uint8ClampedArray' },
  { endowment: rootRealmGlobal.Uint16Array, name: 'Uint16Array' },
  { endowment: rootRealmGlobal.Uint32Array, name: 'Uint32Array' },
  { endowment: rootRealmGlobal.URL, name: 'URL' },
  { endowment: rootRealmGlobal.URLSearchParams, name: 'URLSearchParams' },
  // { endowment: WebAssembly, name: 'WebAssembly' },
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
    // network,
    timeout,
    textDecoder,
    textEncoder,
    // date,
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
