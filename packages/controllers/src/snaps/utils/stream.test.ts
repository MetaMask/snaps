import { stripDotSlash } from './stream';

describe('stripDotSlash', () => {
  it('handles inputs as expected', () => {
    (
      [
        ['./foo', 'foo'],
        ['./', ''],
        ['', ''],
        ['foo', 'foo'],
        [undefined, undefined],
        // Some contrived but illustrative examples
        ['././', './'],
        ['././foo', './foo'],
      ] as const
    ).forEach(([input, expected]) => {
      expect(stripDotSlash(input)).toBe(expected);
    });
  });
});
