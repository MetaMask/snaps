import {
  assertIsOnTransactionRequestArguments,
  isEndowment,
  isEndowmentsArray,
  sanitizeJsonStructure,
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

describe('sanitizeJsonStructure', () => {
  it('should return sanitized JSON', () => {
    // Make sure that getters cannot have side effect
    const testSubject = { a: {}, b: {} };
    let counter = 0;
    Object.defineProperty(testSubject, 'jailbreak', {
      enumerable: true,
      get() {
        counter += 1;
        return counter;
      },
      set(value) {
        return (counter = value);
      },
    });
    const result = sanitizeJsonStructure(testSubject) as { jailbreak: number };

    // Check that the counter is not increasing
    expect(result.jailbreak).toStrictEqual(result.jailbreak);
    // Check that it's a value, not a getter explicitly
    const descriptor = Object.getOwnPropertyDescriptor(result, 'jailbreak');
    expect(descriptor?.value).toBe(result.jailbreak);
    expect(descriptor?.get).toBeUndefined();
    expect(descriptor?.set).toBeUndefined();
  });

  it('should throw an error if circular reference is detected', () => {
    const DIRECT_CIRCULAR_REFERENCE_ARRAY: unknown[] = [];
    DIRECT_CIRCULAR_REFERENCE_ARRAY.push(DIRECT_CIRCULAR_REFERENCE_ARRAY);

    const INDIRECT_CIRCULAR_REFERENCE_ARRAY: unknown[] = [];
    INDIRECT_CIRCULAR_REFERENCE_ARRAY.push([
      [INDIRECT_CIRCULAR_REFERENCE_ARRAY],
    ]);

    const DIRECT_CIRCULAR_REFERENCE_OBJECT: Record<string, unknown> = {};
    DIRECT_CIRCULAR_REFERENCE_OBJECT.prop = DIRECT_CIRCULAR_REFERENCE_OBJECT;

    const INDIRECT_CIRCULAR_REFERENCE_OBJECT: Record<string, unknown> = {
      p1: {
        p2: {
          get p3() {
            return INDIRECT_CIRCULAR_REFERENCE_OBJECT;
          },
        },
      },
    };

    const TO_JSON_CIRCULAR_REFERENCE = {
      toJSON() {
        return {};
      },
    };

    const CIRCULAR_REFERENCE = { prop: TO_JSON_CIRCULAR_REFERENCE };
    TO_JSON_CIRCULAR_REFERENCE.toJSON = function () {
      return CIRCULAR_REFERENCE;
    };

    expect(() =>
      sanitizeJsonStructure(DIRECT_CIRCULAR_REFERENCE_ARRAY),
    ).toThrow('Received non-JSON-serializable value.');
    expect(() =>
      sanitizeJsonStructure(INDIRECT_CIRCULAR_REFERENCE_ARRAY),
    ).toThrow('Received non-JSON-serializable value.');
    expect(() =>
      sanitizeJsonStructure(DIRECT_CIRCULAR_REFERENCE_OBJECT),
    ).toThrow('Received non-JSON-serializable value.');
    expect(() =>
      sanitizeJsonStructure(INDIRECT_CIRCULAR_REFERENCE_OBJECT),
    ).toThrow('Received non-JSON-serializable value.');
    expect(() => sanitizeJsonStructure(TO_JSON_CIRCULAR_REFERENCE)).toThrow(
      'Received non-JSON-serializable value.',
    );
    expect(() => sanitizeJsonStructure(CIRCULAR_REFERENCE)).toThrow(
      'Received non-JSON-serializable value.',
    );
  });
});
