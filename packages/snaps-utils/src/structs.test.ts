import superstruct, {
  defaulted,
  is,
  object,
  string,
  StructError,
  union,
  validate,
} from 'superstruct';

import {
  arrayToGenerator,
  createFromStruct,
  getError,
  literal,
  SnapsStructError,
} from './structs';

describe('literal', () => {
  it.each(['foo', 42, true, false])('validates a literal value', (value) => {
    expect(is(value, literal(value))).toBe(true);
  });

  it('returns a struct with the correct name', () => {
    const [singleError] = validate('foo', literal('bar'));
    expect(singleError?.message).toBe(
      'Expected the literal `"bar"`, but received: "foo"',
    );

    const [unionError] = validate(
      'foo',
      union([literal('bar'), literal('baz')]),
    );
    expect(unionError?.message).toBe(
      'Expected the value to satisfy a union of `"bar" | "baz"`, but received: "foo"',
    );
  });
});

describe('arrayToGenerator', () => {
  it('yields the items in the array', () => {
    const generator = arrayToGenerator([1, 2, 3]);

    expect(generator.next()).toStrictEqual({ done: false, value: 1 });
    expect(generator.next()).toStrictEqual({ done: false, value: 2 });
    expect(generator.next()).toStrictEqual({ done: false, value: 3 });
    expect(generator.next()).toStrictEqual({ done: true, value: undefined });
  });
});

describe('getError', () => {
  it('returns a readable error', () => {
    const error = new StructError(
      {
        branch: [],
        key: 'foo',
        message: 'Expected a string, but received: 42',
        path: ['foo'],
        refinement: 'bar',
        type: 'string',
        value: 42,
      },
      () =>
        arrayToGenerator([
          {
            branch: [],
            key: 'bar',
            message: 'Expected a string, but received: 42',
            path: ['bar'],
            refinement: 'bar',
            type: 'string',
            value: 123,
          },
        ]),
    );

    const readableError = getError({
      prefix: 'Foo',
      suffix: 'Bar',
      error,
    });

    expect(readableError).toBeInstanceOf(SnapsStructError);
    expect(readableError.message).toBe(
      'Foo: At path: foo -- Expected a string, but received: 42. Bar',
    );

    expect(readableError.failures).toBeInstanceOf(Function);
    expect([...readableError.failures()]).toStrictEqual([
      error,
      {
        branch: [],
        key: 'foo',
        message: 'Expected a string, but received: 42',
        path: ['foo'],
        refinement: 'bar',
        type: 'string',
        value: 42,
      },
      {
        branch: [],
        key: 'bar',
        message: 'Expected a string, but received: 42',
        path: ['bar'],
        refinement: 'bar',
        type: 'string',
        value: 123,
      },
    ]);
  });

  it('returns a readable error without a suffix', () => {
    const error = new StructError(
      {
        branch: [],
        key: 'foo',
        message: 'Expected a string, but received: 42',
        path: ['foo'],
        refinement: 'bar',
        type: 'string',
        value: 42,
      },
      () => arrayToGenerator([]),
    );

    const readableError = getError({
      prefix: 'Foo',
      error,
    });

    expect(readableError).toBeInstanceOf(SnapsStructError);
    expect(readableError.message).toBe(
      'Foo: At path: foo -- Expected a string, but received: 42.',
    );
  });
});

describe('createFromStruct', () => {
  const DEFAULT_STRUCT = defaulted(
    object({
      foo: defaulted(string(), 'bar'),
    }),
    {},
  );

  it('creates a value from a struct', () => {
    const value = createFromStruct(undefined, DEFAULT_STRUCT, 'Foo');
    expect(value).toStrictEqual({
      foo: 'bar',
    });
  });

  it('throws readable errors', () => {
    expect(() => createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo')).toThrow(
      'Foo: At path: foo -- Expected a string, but received: 42.',
    );

    expect(() =>
      createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo', 'Bar'),
    ).toThrow('Foo: At path: foo -- Expected a string, but received: 42. Bar');
  });

  it('throws the raw error if an unknown error is thrown', () => {
    jest.spyOn(superstruct, 'create').mockImplementation(() => {
      throw new Error('Unknown error.');
    });

    expect(() =>
      createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo', 'Bar'),
    ).toThrow('Unknown error.');
  });
});
