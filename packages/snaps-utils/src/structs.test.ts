import { union, literal } from '@metamask/snaps-sdk';
import type { Struct } from '@metamask/superstruct';
import {
  create,
  size,
  defaulted,
  number,
  object,
  string,
  validate,
  union as superstructUnion,
  array,
  is,
} from '@metamask/superstruct';
import { assert } from '@metamask/utils';
import { bold, green, red } from 'chalk';

import { RpcOriginsStruct } from './json-rpc';
import { HandlerCaveatsStruct } from './manifest';
import {
  arrayToGenerator,
  createFromStruct,
  getError,
  getStructErrorMessage,
  getStructErrorPrefix,
  getStructFailureMessage,
  SnapsStructError,
  getStructFromPath,
  getUnionStructNames,
  named,
  validateUnion,
  createUnion,
  mergeStructs,
} from './structs';

jest.mock('@metamask/superstruct', () => {
  return {
    ...jest.requireActual('@metamask/superstruct'),
    create: jest.fn(),
  };
});
const createMock = jest.mocked(create);

/**
 * Get an error from a struct, for testing.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @returns The error.
 * @throws If the value passes validation.
 */
function getStructError(value: unknown, struct: Struct<any>) {
  const [error] = validate(value, struct);
  assert(error, 'Expected an error to be thrown.');

  return error;
}

describe('named', () => {
  it('sets the struct name', () => {
    expect(named('foo', string()).type).toBe('foo');
    expect(named('bar', array()).type).toBe('bar');
  });

  it('validates using the original struct', () => {
    const struct = named('foo', string());
    const [error] = validate(42, struct);
    expect(error?.message).toBe('Expected a string, but received: 42');
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
    const struct = object({
      foo: string(),
      bar: string(),
    });

    const error = getStructError({ foo: 42 }, struct);
    const readableError = getError({
      struct,
      error,
      prefix: 'Foo',
      suffix: 'Bar',
    });

    expect(readableError).toBeInstanceOf(SnapsStructError);
    expect(readableError.message).toBe(
      `Foo.\n\n  • At path: ${bold('foo')} — Expected a value of type ${green(
        'string',
      )}, but received: ${red('42')}.\n  • At path: ${bold(
        'bar',
      )} — Expected a value of type ${green('string')}, but received: ${red(
        'undefined',
      )}.\n\nBar`,
    );

    expect(readableError.failures).toBeInstanceOf(Function);
    expect([...readableError.failures()]).toStrictEqual([
      error,
      ...error.failures(),
    ]);
  });

  it('returns a readable error without a suffix', () => {
    const struct = object({
      foo: string(),
    });

    const error = getStructError({ foo: 42 }, struct);
    const readableError = getError({
      struct,
      error,
      prefix: 'Foo',
    });

    expect(readableError).toBeInstanceOf(SnapsStructError);
    expect(readableError.message).toBe(
      `Foo.\n\n  • At path: ${bold('foo')} — Expected a value of type ${green(
        'string',
      )}, but received: ${red('42')}.`,
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

  beforeEach(() => {
    createMock.mockImplementation(
      jest.requireActual('@metamask/superstruct').create,
    );
  });

  it('creates a value from a struct', () => {
    const value = createFromStruct(undefined, DEFAULT_STRUCT, 'Foo');
    expect(value).toStrictEqual({
      foo: 'bar',
    });
  });

  it('throws readable errors', () => {
    expect(() => createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo')).toThrow(
      `Foo.\n\n  • At path: ${bold('foo')} — Expected a value of type ${green(
        'string',
      )}, but received: ${red('42')}.`,
    );

    expect(() =>
      createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo', 'Bar'),
    ).toThrow(
      `Foo.\n\n  • At path: ${bold('foo')} — Expected a value of type ${green(
        'string',
      )}, but received: ${red('42')}.\n\nBar`,
    );
  });

  it('throws the raw error if an unknown error is thrown', () => {
    createMock.mockImplementationOnce(() => {
      throw new Error('Unknown error.');
    });

    expect(() =>
      createFromStruct({ foo: 42 }, DEFAULT_STRUCT, 'Foo', 'Bar'),
    ).toThrow('Unknown error.');
  });
});

describe('getStructFromPath', () => {
  it('gets a struct from a failure path', () => {
    const struct = object({
      foo: union([string(), number()]),
    });

    expect(getStructFromPath(struct, [])).toBe(struct);
    expect(getStructFromPath(struct, ['foo'])).toBe(struct.schema.foo);
    expect(getStructFromPath(struct, ['foo', 'bar'])).toBe(struct.schema.foo);
  });
});

describe('getUnionStructNames', () => {
  it('gets the union names from a union struct', () => {
    const struct = union([literal('foo'), literal('bar')]);
    expect(getUnionStructNames(struct)).toStrictEqual([
      `${green('"foo"')}`,
      `${green('"bar"')}`,
    ]);
  });

  it('returns null if the struct is not a union', () => {
    const struct = object({});
    expect(getUnionStructNames(struct)).toBeNull();
  });
});

describe('getStructErrorPrefix', () => {
  it('returns an empty string for a failure without a path', () => {
    const error = getStructError(42, string());
    expect(getStructErrorPrefix(error)).toBe('');
  });

  it('returns an empty string for a failure with type never', () => {
    const error = getStructError({ foo: 42 }, object({}));
    expect(getStructErrorPrefix(error)).toBe('');
  });

  it('returns a readable path for a failure with a path', () => {
    const error = getStructError(
      {
        foo: {
          bar: 42,
        },
      },
      object({ foo: object({ bar: string() }) }),
    );
    expect(getStructErrorPrefix(error)).toBe(`At path: ${bold('foo.bar')} — `);
  });
});

describe('getStructFailureMessage', () => {
  it('returns a readable error from a string struct', () => {
    const struct = string();
    const error = getStructError(42, struct);
    expect(getStructFailureMessage(struct, error)).toBe(
      `Expected a value of type ${green('string')}, but received: ${red(
        '42',
      )}.`,
    );
  });

  it('returns a readable error from an object struct', () => {
    const struct = object({ foo: string() });
    const error = getStructError({ bar: 42 }, struct);
    expect(getStructFailureMessage(struct, error)).toBe(
      `At path: ${bold('foo')} — Expected a value of type ${green(
        'string',
      )}, but received: ${red('undefined')}.`,
    );
  });

  it('returns a readable error for an unknown key', () => {
    const struct = object({});
    const error = getStructError({ bar: 42 }, struct);
    expect(getStructFailureMessage(struct, error)).toBe(
      `Unknown key: ${bold('bar')}, received: ${red('42')}.`,
    );
  });

  it('returns a readable error for an union of literals', () => {
    const struct = union([literal('bar'), literal('baz')]);
    const error = getStructError('foo', struct);
    expect(getStructFailureMessage(struct, error)).toBe(
      `Expected the value to be one of: ${green('"bar"')}, ${green(
        '"baz"',
      )}, but received: ${red('"foo"')}.`,
    );
  });

  it('returns a readable error for a literal', () => {
    const error = getStructError('foo', literal('bar'));
    expect(getStructFailureMessage(literal('bar'), error)).toBe(
      `Expected the value to be \`${green('"bar"')}\`, but received: ${red(
        '"foo"',
      )}.`,
    );
  });

  it('returns a readable error for a string with the wrong size', () => {
    const error = getStructError('', size(string(), 1, 5));
    expect(getStructFailureMessage(size(string(), 1, 5), error)).toBe(
      `Expected a string with a length between ${green('1')} and ${green(
        '5',
      )}, but received one with a length of ${red('0')}.`,
    );
  });

  it('returns a readable error for an array with the wrong size', () => {
    const error = getStructError([], size(array(), 1, 5));
    expect(getStructFailureMessage(size(array(), 1, 5), error)).toBe(
      `Expected an array with a length between ${green('1')} and ${green(
        '5',
      )}, but received one with a length of ${red('0')}.`,
    );
  });

  it('returns a fallback for non-formatted unions', () => {
    const struct = superstructUnion([literal('bar'), literal('baz')]);
    const error = getStructError('foo', struct);
    expect(getStructFailureMessage(struct, error)).toBe(
      'Expected the value to satisfy a union of `"bar" | "baz"`, but received: "foo".',
    );
  });
});

describe('getStructErrorMessage', () => {
  it('returns a list of readable errors', () => {
    const struct = object({ foo: string() });
    const error = getStructError({ bar: 42 }, struct);

    const messages = [
      getStructFailureMessage(struct, error.failures()[0]),
      getStructFailureMessage(struct, error.failures()[1]),
    ];

    expect(getStructErrorMessage(struct, error.failures())).toBe(
      messages.map((message) => `  • ${message}`).join('\n'),
    );
  });
});

describe('validateUnion', () => {
  it('throws a readable error if the type does not satisfy any of the expected types', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, BarStruct]);
    expect(() =>
      validateUnion({ type: 'c', value: 42 }, Union, 'type'),
    ).toThrow(
      `At path: type — Expected the value to be one of: "a", "b", but received: "c".`,
    );
  });

  it('throws a readable error if the value does not satisfy the union type', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, BarStruct]);
    expect(() =>
      validateUnion({ type: 'a', value: 42 }, Union, 'type'),
    ).toThrow(
      `At path: value — Expected a value of type string, but received: 42.`,
    );
  });

  it('throws a readable error if the value does not satisfy the union type with multiple options', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const OtherFooStruct = object({
      type: literal('a'),
      id: number(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, OtherFooStruct, BarStruct]);
    expect(() =>
      validateUnion({ type: 'a', value: 42 }, Union, 'type'),
    ).toThrow(
      `At path: value — Expected a value of type string, but received: 42.`,
    );

    expect(() =>
      validateUnion({ type: 'a', id: 'foo' }, Union, 'type'),
    ).toThrow(
      `At path: id — Expected a value of type number, but received: "foo".`,
    );
  });

  it('does not throw if the value satisfies the union', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const OtherFooStruct = object({
      type: literal('a'),
      id: number(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, OtherFooStruct, BarStruct]);

    expect(() =>
      validateUnion({ type: 'a', value: 'foo' }, Union, 'type'),
    ).not.toThrow();

    expect(() =>
      validateUnion({ type: 'a', id: 42 }, Union, 'type'),
    ).not.toThrow();

    expect(() =>
      validateUnion({ type: 'b', value: 42 }, Union, 'type'),
    ).not.toThrow();
  });
});

describe('createUnion', () => {
  it('throws a readable error if the type does not satisfy any of the expected types', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, BarStruct]);
    expect(() => createUnion({ type: 'c', value: 42 }, Union, 'type')).toThrow(
      `At path: type — Expected the value to be one of: "a", "b", but received: "c".`,
    );
  });

  it('throws a readable error if the value does not satisfy the union type', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, BarStruct]);
    expect(() => createUnion({ type: 'a', value: 42 }, Union, 'type')).toThrow(
      `At path: value — Expected a value of type string, but received: 42.`,
    );
  });

  it('creates a value from a union struct', () => {
    const FooStruct = object({
      type: literal('a'),
      value: string(),
    });

    const BarStruct = object({
      type: literal('b'),
      value: number(),
    });

    const Union = union([FooStruct, BarStruct]);
    const value = createUnion({ type: 'a', value: 'foo' }, Union, 'type');
    expect(value).toStrictEqual({ type: 'a', value: 'foo' });
  });

  it('creates a value from a union struct with a default', () => {
    const FooStruct = object({
      type: literal('a'),
      value: defaulted(string(), 'bar'),
    });

    const BarStruct = object({
      type: literal('b'),
      value: defaulted(number(), 42),
    });

    const Union = union([FooStruct, BarStruct]);
    const value = createUnion({ type: 'a' }, Union, 'type');
    expect(value).toStrictEqual({ type: 'a', value: 'bar' });
  });
});

describe('mergeStructs', () => {
  it('merges objects', () => {
    const struct1 = object({ a: string(), b: string(), c: string() });
    const struct2 = object({ b: number() });
    const struct3 = object({ a: number() });

    const mergedStruct = mergeStructs(struct1, struct2, struct3);
    expect(is({ a: 1, b: 2, c: 'c' }, mergedStruct)).toBe(true);
    expect(is({ a: 'a', b: 2, c: 'c' }, mergedStruct)).toBe(false);
    expect(is({ a: 1, b: 2, c: 3 }, mergedStruct)).toBe(false);
  });

  it('keeps refinements', () => {
    const struct = mergeStructs(HandlerCaveatsStruct, RpcOriginsStruct);
    expect(is({}, struct)).toBe(false);
    expect(is({ dapps: true }, struct)).toBe(true);
  });
});
