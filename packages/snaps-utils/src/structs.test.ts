import { assert } from '@metamask/utils';
import { bold, green, red } from 'chalk';
import type { Struct } from 'superstruct';
import superstruct, {
  create,
  defaulted,
  is,
  number,
  object,
  string,
  validate,
  union as superstructUnion,
  array,
} from 'superstruct';

import {
  arrayToGenerator,
  createFromStruct,
  file,
  getError,
  getStructErrorMessage,
  getStructErrorPrefix,
  getStructFailureMessage,
  literal,
  union,
  SnapsStructError,
  getStructFromPath,
  getUnionStructNames,
  named,
} from './structs';

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

describe('file', () => {
  it('resolves a file path relative to the current working directory', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

    expect(is('packages/snaps-utils/src/structs.test.ts', file())).toBe(true);
    expect(create('packages/snaps-utils/src/structs.test.ts', file())).toBe(
      '/foo/bar/packages/snaps-utils/src/structs.test.ts',
    );
    expect(create('/packages/snaps-utils/src/structs.test.ts', file())).toBe(
      '/packages/snaps-utils/src/structs.test.ts',
    );
  });
});

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
    jest.spyOn(superstruct, 'create').mockImplementation(() => {
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
