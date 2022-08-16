import { assert, AssertionError } from './assert';

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
