import { setDiff } from './utils';

describe('setDiff', () => {
  it('does nothing on empty type {}-B', () => {
    expect(setDiff({}, { a: 'foo' })).toStrictEqual({});
  });

  it('does nothing on empty type A-{}', () => {
    expect(setDiff({ a: 'foo', b: 'bar' }, {})).toStrictEqual({
      a: 'foo',
      b: 'bar',
    });
  });

  it('does a difference', () => {
    expect(setDiff({ a: 'foo', b: 'bar' }, { a: 0 })).toStrictEqual({
      b: 'bar',
    });
  });

  it('additional B properties have no effect in A-B', () => {
    expect(
      setDiff({ a: 'foo', b: 'bar' }, { b: 0, c: 'foobar' }),
    ).toStrictEqual({ a: 'foo' });
  });

  it('works for the same object A-A', () => {
    const object = { a: 'foo', b: 'bar' };
    expect(setDiff(object, object)).toStrictEqual({});
  });
});
