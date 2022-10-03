import { assert, AssertionError, assertStruct } from './assert';
import { EventStruct } from './notification';

describe('assert', () => {
  it('succeeds', () => {
    expect(() => assert(true)).not.toThrow();
  });

  it('narrows type scope', () => {
    const item: { foo: 1 } | undefined = { foo: 1 };

    assert(item !== undefined);

    // This will fail to compile otherwise
    expect(item.foo).toStrictEqual(1);
  });

  it('throws', () => {
    expect(() => assert(false, 'Thrown')).toThrow(AssertionError);
  });

  it('throws with default message', () => {
    expect(() => assert(false)).toThrow('Assertion failed');
  });

  it('throw custom error', () => {
    class MyError extends Error {}
    expect(() => assert(false, new MyError('Thrown'))).toThrow(MyError);
  });
});

describe('assertStruct', () => {
  it('does not throw for a valid value', () => {
    expect(() =>
      assertStruct({ name: 'foo', data: 'bar' }, EventStruct),
    ).not.toThrow();
  });

  it('throws meaningful error messages for an invalid value', () => {
    expect(() => assertStruct({ data: 'foo' }, EventStruct)).toThrow(
      'Assertion failed: At path: name -- Expected a string, but received: undefined',
    );

    expect(() => assertStruct({ name: 1, data: 'foo' }, EventStruct)).toThrow(
      'Assertion failed: At path: name -- Expected a string, but received: 1',
    );
  });

  it('throws with a custom error prefix', () => {
    expect(() =>
      assertStruct({ data: 'foo' }, EventStruct, 'Invalid event'),
    ).toThrow(
      'Invalid event: At path: name -- Expected a string, but received: undefined',
    );
  });
});
