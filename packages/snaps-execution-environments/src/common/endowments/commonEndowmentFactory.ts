import crypto from './crypto';
import date from './date';
import interval from './interval';
import math from './math';
import network from './network';
import textDecoder from './textDecoder';
import textEncoder from './textEncoder';
import timeout from './timeout';

export type EndowmentFactory = {
  names: readonly string[];
  factory: () => { [key: string]: unknown };
};

export type CommonEndowmentSpecification = {
  endowment: unknown;
  name: string;
};

// Array of common endowments
const commonEndowments: CommonEndowmentSpecification[] = [
  { endowment: AbortController, name: 'AbortController' },
  { endowment: AbortSignal, name: 'AbortSignal' },
  { endowment: ArrayBuffer, name: 'ArrayBuffer' },
  { endowment: atob, name: 'atob' },
  { endowment: BigInt, name: 'BigInt' },
  { endowment: BigInt64Array, name: 'BigInt64Array' },
  { endowment: BigUint64Array, name: 'BigUint64Array' },
  { endowment: btoa, name: 'btoa' },
  { endowment: DataView, name: 'DataView' },
  { endowment: Float32Array, name: 'Float32Array' },
  { endowment: Float64Array, name: 'Float64Array' },
  { endowment: Int8Array, name: 'Int8Array' },
  { endowment: Int16Array, name: 'Int16Array' },
  { endowment: Int32Array, name: 'Int32Array' },
  { endowment: Uint8Array, name: 'Uint8Array' },
  { endowment: Uint8ClampedArray, name: 'Uint8ClampedArray' },
  { endowment: Uint16Array, name: 'Uint16Array' },
  { endowment: Uint32Array, name: 'Uint32Array' },
  { endowment: URL, name: 'URL' },
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
  ];

  commonEndowments.forEach((endowmentSpecification) => {
    const endowment = {
      names: [endowmentSpecification.name] as const,
      factory: () => {
        return {
          [endowmentSpecification.name]: harden(
            endowmentSpecification.endowment,
          ),
        } as const;
      },
    };
    endowmentFactories.push(endowment);
  });

  return endowmentFactories;
};

export default buildCommonEndowments;
