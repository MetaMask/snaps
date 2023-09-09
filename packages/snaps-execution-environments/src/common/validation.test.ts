import {
  assertIsOnNameLookupRequestArguments,
  assertIsOnTransactionRequestArguments,
  isEndowment,
  isEndowmentsArray,
} from './validation';

describe('isEndowment', () => {
  it.each(['foo', 'bar', 'baz'])('returns true for %s', (value) => {
    expect(isEndowment(value)).toBe(true);
  });

  it.each([true, false, null, undefined, 0, 1, [], {}])(
    'returns false for %s',
    (value) => {
      expect(isEndowment(value)).toBe(false);
    },
  );
});

describe('isEndowmentsArray', () => {
  it.each([
    { array: ['foo', 'bar', 'baz'] },
    { array: ['foo', 'bar', 'baz', 'qux'] },
  ])('returns true for a valid endowments array', ({ array }) => {
    expect(isEndowmentsArray(array)).toBe(true);
  });

  it.each([
    { array: [true, false, null, undefined, 0, 1, [], {}] },
    { array: ['foo', 'bar', 'baz', 0] },
    { array: ['foo', 'bar', 'baz', true] },
    { array: ['foo', 'bar', 'baz', false] },
    { array: ['foo', 'bar', 'baz', null] },
    { array: ['foo', 'bar', 'baz', undefined] },
    { array: ['foo', 'bar', 'baz', []] },
    { array: ['foo', 'bar', 'baz', {}] },
  ])('returns false for an invalid endowments array', (value) => {
    expect(isEndowmentsArray(value)).toBe(false);
  });
});

describe('assertIsOnTransactionRequestArguments', () => {
  it.each([
    { transaction: {}, chainId: 'eip155:1', transactionOrigin: null },
    {
      transaction: { foo: 'bar' },
      chainId: 'bip122:000000000019d6689c085ae165831e93',
      transactionOrigin: null,
    },
    {
      transaction: { bar: 'baz' },
      chainId: 'eip155:2',
      transactionOrigin: null,
    },
  ])('does not throw for a valid transaction params object', (args) => {
    expect(() => assertIsOnTransactionRequestArguments(args)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'foo',
    [],
    {},
    { transaction: { foo: 'bar' }, chainId: 1 },
    { transaction: { foo: 'bar' }, chainId: '0x1', foo: 'bar' },
  ])(
    'throws if the value is not a valid transaction params object',
    (value) => {
      expect(() => assertIsOnTransactionRequestArguments(value as any)).toThrow(
        'Invalid request params:',
      );
    },
  );
});

describe('assertIsOnNameLookupRequestArguments', () => {
  it.each([
    { chainId: 'eip155:1', domain: 'foo.lens' },
    {
      chainId: 'eip155:1',
      address: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
    },
  ])('does not throw for a valid lookup request object', (args) => {
    expect(() => assertIsOnNameLookupRequestArguments(args)).not.toThrow();
  });

  it.each([
    { chainId: 123, domain: 12 },
    { chainId: 'eip155:1', domain: false },
    { chainId: 'foo' },
    { domain: 'foo.lens' },
    { chainId: 'eip155:1', address: 123 },
    { chainId: 'eip155:1', address: false },
    { address: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb' },
    {
      chainId: 123,
      domain: 'foo.lens',
      address: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
    },
  ])(
    'throws if the value is not a valid transaction params object',
    (value) => {
      expect(() => assertIsOnNameLookupRequestArguments(value)).toThrow(
        'Invalid request params:',
      );
    },
  );
});
