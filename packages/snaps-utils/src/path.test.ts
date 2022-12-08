import { AssertionError } from '@metamask/utils';

import { normalizeRelative } from './path';

describe('normalizeRelative', () => {
  it('throws on absolute paths', () => {
    expect(() => normalizeRelative('/foo/bar.js')).toThrow(AssertionError);
  });

  it('throws on URIs', () => {
    expect(() => normalizeRelative('http://foo.bar')).toThrow(
      'Path "http://foo.bar" potentially an URI instead of local relative',
    );
  });

  it('removes "./" prefix', () => {
    expect(normalizeRelative('./foo/bar.js')).toBe('foo/bar.js');
  });

  it("does nothing if there's no prefix", () => {
    expect(normalizeRelative('foo/bar.js')).toBe('foo/bar.js');
  });
});
