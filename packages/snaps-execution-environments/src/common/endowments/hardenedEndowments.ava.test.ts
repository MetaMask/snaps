// eslint-disable-next-line import/no-unassigned-import
import 'ses';
// @ts-expect-error Walker has no types yet.
import Walker from '@lavamoat/walker';
import test from 'ava';
// FinalizationRegistry will fix type errors in tests related to network endowment.
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
import FinalizationRegistry from 'globals';

import buildCommonEndowments from './commonEndowmentFactory';
import Crypto from './crypto';
import date from './date';
import interval from './interval';
import math from './math';
import network from './network';
import timeout from './timeout';

const globalThis = global;

// Note: harden is only defined after calling lockdown
lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
});

/**
 * Object walker test utility function.
 * This function will instantiate and configure @lavamoat/walker for testing
 * endowment specific use case. It will also adapt its result to a boolean value.
 *
 * @param subject - Subject to be tested.
 * @param target - Target object.
 * @returns True if target object is found, false otherwise.
 */
function walkAndSearch(subject: unknown, target: unknown) {
  let result = false;
  const walker = new Walker(
    (value: unknown) => {
      result = target === value;
      return result;
    },
    { maxRecursionLimit: 100, onShouldIgnoreError: () => true },
  );
  walker.walk(subject);
  return result;
}

// Retrieve registered endowments
const registeredEndowments = buildCommonEndowments();
// Call factory method for each endowment. It will harden each of them.
// This is how endowments are created (see index.ts / createEndowments()).
registeredEndowments.forEach((endowment) => endowment.factory());

// Specially attenuated endowments or endowments that require
// to be imported in a different way
const { SubtleCrypto, crypto } = Crypto.factory();
const {
  setTimeout: setTimeoutAttenuated,
  clearTimeout: clearTimeoutAttenuated,
} = timeout.factory();
const {
  setInterval: setIntervalAttenuated,
  clearInterval: clearIntervalAttenuated,
} = interval.factory();
const { Math: mathAttenuated } = math.factory();
const { fetch: fetchAttenuated } = network.factory();
const { Date: DateAttenuated } = date.factory();

// All the endowments to be tested
const testSubjects = {
  // --- Constructor functions
  BigInt: {
    endowments: { BigInt },
    factory: () => BigInt(3),
  },
  SubtleCrypto: {
    endowments: { SubtleCrypto },
    factory: () => undefined,
  },
  TextDecoder: {
    endowments: { TextDecoder },
    factory: () => new TextDecoder(),
  },
  TextEncoder: {
    endowments: { TextEncoder },
    factory: () => new TextEncoder(),
  },
  URL: {
    endowments: { URL },
    factory: () => new URL('https://metamask.io/snaps/'),
  },
  Int8Array: {
    endowments: { Int8Array },
    factory: () => new Int8Array(),
  },
  Uint8Array: {
    endowments: { Uint8Array },
    factory: () => new Uint8Array(),
  },
  Uint8ClampedArray: {
    endowments: { Uint8ClampedArray },
    factory: () => new Uint8ClampedArray(),
  },
  Int16Array: {
    endowments: { Int16Array },
    factory: () => new Int16Array(),
  },
  Uint16Array: {
    endowments: { Uint16Array },
    factory: () => new Uint16Array(),
  },
  Int32Array: {
    endowments: { Int32Array },
    factory: () => new Int32Array(),
  },
  Uint32Array: {
    endowments: { Uint32Array },
    factory: () => new Uint32Array(),
  },
  Float32Array: {
    endowments: { Float32Array },
    factory: () => new Float32Array(),
  },
  Float64Array: {
    endowments: { Float64Array },
    factory: () => new Float64Array(),
  },
  BigInt64Array: {
    endowments: { BigInt64Array },
    factory: () => new BigInt64Array(),
  },
  BigUint64Array: {
    endowments: { BigUint64Array },
    factory: () => new BigUint64Array(),
  },
  DataView: {
    endowments: { DataView, ArrayBuffer },
    factory: () => new DataView(new ArrayBuffer(64)),
  },
  ArrayBuffer: {
    endowments: { ArrayBuffer },
    factory: () => new ArrayBuffer(64),
  },
  AbortController: {
    endowments: { AbortController },
    factory: () => new AbortController(),
  },
  AbortSignal: {
    endowments: { AbortSignal },
    // @ts-expect-error abort() method exists in browser
    factory: () => AbortSignal.abort(),
  },
  DateAttenuated: {
    endowments: { DateAttenuated },
    factory: () => new DateAttenuated(),
  },
  // --- Objects
  console: {
    endowments: { console },
    factory: () => console,
  },
  crypto: {
    endowments: { crypto },
    factory: () => crypto,
  },
  mathAttenuated: {
    endowments: { mathAttenuated },
    factory: () => mathAttenuated,
  },
  WebAssembly: {
    endowments: { WebAssembly },
    factory: () => WebAssembly,
  },
  // --- Functions
  atob: {
    endowments: { atob },
    factory: () => atob('U25hcHM='),
  },
  btoa: {
    endowments: { btoa },
    factory: () => btoa('Snaps'),
  },
  setTimeoutAttenuated: {
    endowments: { setTimeoutAttenuated },
    factory: () => setTimeoutAttenuated((param: unknown) => param, 1),
  },
  clearTimeoutAttenuated: {
    endowments: { clearTimeoutAttenuated },
    factory: () => undefined,
  },
  setIntervalAttenuated: {
    endowments: { setIntervalAttenuated },
    factory: () => setIntervalAttenuated((param: unknown) => param, 100000),
  },
  clearIntervalAttenuated: {
    endowments: { clearIntervalAttenuated },
    factory: () => undefined,
  },
  fetchAttenuated: {
    endowments: { fetchAttenuated },
    factory: () => undefined,
  },
};

// These are fake types just to make this test work with the TypeScript
/* eslint-disable @typescript-eslint/naming-convention */
type HardenedEndowmentSubject = {
  __flag: unknown;
  prototype: { __flag: unknown };
};
type HardenedEndowmentInstance = {
  __flag: unknown;
  __proto__: { __flag: unknown };
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * This function represents utility which is executed inside a compartment.
 * It will try to change a subject or its prototype.
 * Potential errors are caught and reported in an array returned.
 *
 * @param subject - Test subject (instance, object, function).
 * @param factory - Factory that creates an instance using constructor function.
 * @returns Array of error messages.
 */
function code(
  subject: HardenedEndowmentSubject,
  factory: () => HardenedEndowmentInstance,
): unknown[] {
  const log = [];
  const instance = factory();
  try {
    subject.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    if (instance) {
      instance.__flag = 'not_secure';
    }
  } catch (error) {
    log.push(error.message);
  }
  try {
    subject.prototype.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // eslint-disable-next-line no-proto
    instance.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // @ts-expect-error Test unusual approach for a security reasons.
    // eslint-disable-next-line no-proto
    subject.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  return log;
}

Object.entries(testSubjects).forEach(([name, { endowments, factory }]) => {
  test(`hardening protects ${name}`, (expect) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const source = `;(${code})(${name},${factory})`;
    // @ts-expect-error Indexing error is expected (endowment structure should be enough).
    const subject = endowments[name];
    const c1 = new Compartment(endowments, {}, {});
    const errors = c1.evaluate(source);
    const instance = factory();

    expect.falsy(subject.__flag, 'flag is leaking via endowed object');
    if (instance) {
      expect.falsy(instance.__flag, 'flag is leaking via prototype');
    }
    expect.assert(errors.length > 0);
  });

  if (factory()) {
    test(`endowment ${name} does not leak global this`, (expect) => {
      const instance = factory();
      const searchResult = walkAndSearch(instance, globalThis);

      expect.is(searchResult, false);
    });
  }
});
