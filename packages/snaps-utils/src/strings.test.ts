import { indent } from './strings';

describe('indent', () => {
  it('indents a string by a given number of spaces', () => {
    expect(indent('foo')).toBe('  foo');
    expect(indent('foo', 4)).toBe('    foo');
    expect(indent('foo\nbar')).toBe('  foo\n  bar');
    expect(indent('foo\nbar', 4)).toBe('    foo\n    bar');
  });
});
