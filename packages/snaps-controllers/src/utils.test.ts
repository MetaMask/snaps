import { AssertionError } from '@metamask/utils';

import { ensureRelative, setDiff } from './utils';

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

describe('ensureRelative', () => {
  it('throws on absolute paths', () => {
    expect(() => ensureRelative('/foo/bar.js')).toThrow(AssertionError);
  });

  it('throws on URIs', () => {
    expect(() => ensureRelative('http://foo.bar')).toThrow(
      'Path "http://foo.bar" potentially an URI instead of local relative',
    );
  });

  it('does nothing on "./" paths', () => {
    expect(ensureRelative('./foo/bar.js')).toBe('./foo/bar.js');
  });

  it('adds "./" if it\'s missing', () => {
    expect(ensureRelative('foo/bar.js')).toBe('./foo/bar.js');
  });
});
