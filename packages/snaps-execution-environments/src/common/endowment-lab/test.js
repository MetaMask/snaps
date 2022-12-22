require('ses');
// Note: harden is only defined after calling lockdown
lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
});

const test = require('ava');

const testSubjects = {
  BigInt: {
    endowments: { BigInt },
    factory: () => BigInt(3),
  },
  // SubtleCrypto: {
  //     endowments: { SubtleCrypto },
  //     factory: () => new SubtleCrypto(),
  // }, //not in Node, hard to test
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
    factory: () => new URL('https://naugtur.pl'),
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
    factory: () => new DataView(new ArrayBuffer()),
  },
  ArrayBuffer: {
    endowments: { ArrayBuffer },
    factory: () => new ArrayBuffer(),
  },
  AbortController: {
    endowments: { AbortController },
    factory: () => new AbortController(),
  },
  AbortSignal: {
    endowments: { AbortSignal },
    factory: () => AbortSignal.abort(),
  },
};

function code(Subject, factory) {
  const log = [];
  const instance = factory();
  try {
    Subject.__flag = '1337';
  } catch (error) {
    log.push(error.message);
  }
  try {
    instance.__flag = '1337';
  } catch (error) {
    log.push(error.message);
  }
  try {
    Subject.prototype.__flag = '1337';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // eslint-disable-next-line
    instance.__proto__.__flag = '1337';
  } catch (error) {
    log.push(error.message);
  }
  return log;
}

Object.entries(testSubjects).forEach(([name, { endowments, factory }]) => {
  test(`hardening protects ${name}`, (expect) => {
    const source = `;(${code})(${name},${factory})`;
    const Subject = endowments[name];
    const c1 = new Compartment(endowments, {}, {});
    const errors = c1.evaluate(source);
    const instance = factory();

    expect.falsy(Subject.__flag, 'flag is leaking via endowed object');
    expect.falsy(instance.__flag, 'flag is leaking via prototype');
    expect.assert(errors.length > 0);
  });
});
