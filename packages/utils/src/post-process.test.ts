import { postProcessBundle } from './post-process';

describe('postProcessBundle', () => {
  it('handles null input', () => {
    expect(postProcessBundle(null)).toBeNull();
  });

  it('trims the string', () => {
    expect(postProcessBundle(' trimMe ')).toStrictEqual('trimMe');
  });

  it('strips comments', () => {
    [
      ['/* delete me */postProcessMe', 'postProcessMe'],
      ['oi// hello\npostProcessMe', 'oi\npostProcessMe'],
      ['oi/**********/\npostProcessMe//hello', 'oipostProcessMe'],
      ['oi/***/\npostProcessMe//hello', 'oipostProcessMe'],
      // We used to have issues with this one and our comment stripping
      ['oi/**/\npostProcessMe//hello', 'oi\npostProcessMe'],
      ['foo/** /* **/bar', 'foobar'],
      ['foo/** /** **/bar', 'foobar'],
    ].forEach(([input, expected]) => {
      expect(postProcessBundle(input)).toStrictEqual(expected);
    });
  });

  it('ignores comments if configured to do so', () => {
    expect(
      postProcessBundle('/* leave me alone */postProcessMe', {
        stripComments: false,
      }),
    ).toStrictEqual('/* leave me alone */postProcessMe');
  });

  it('breaks up HTML comment tokens', () => {
    [
      ['foo;\n<!--', 'foo;\n< !--'],
      ['-->\nbar', '-- >\nbar'],
    ].forEach(([input, output]) => {
      expect(
        postProcessBundle(input, { transformHtmlComments: false }),
      ).toStrictEqual(input);

      expect(
        postProcessBundle(input, { transformHtmlComments: true }),
      ).toStrictEqual(output);
    });
  });

  it('applies regeneratorRuntime hack', () => {
    expect(postProcessBundle('(regeneratorRuntime)')).toStrictEqual(
      'var regeneratorRuntime;\n(regeneratorRuntime)',
    );
  });

  it('throws an error if the postprocessed string is empty', () => {
    expect(() => postProcessBundle(' ')).toThrow(/^Bundled code is empty/u);
  });
});
