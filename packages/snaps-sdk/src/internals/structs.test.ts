import { is, validate } from 'superstruct';

import { enumValue, literal, union } from './structs';

describe('enumValue', () => {
  it('validates an enum value', () => {
    enum Foo {
      Bar = 'bar',
      Baz = 'baz',
    }

    const struct = enumValue(Foo.Bar);

    expect(is('bar', struct)).toBe(true);
    expect(is('baz', struct)).toBe(false);
    expect(is(Foo.Bar, struct)).toBe(true);
    expect(is(Foo.Baz, struct)).toBe(false);
  });
});

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
