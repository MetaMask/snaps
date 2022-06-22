import { postProcessBundle } from './post-process';

describe('postProcessBundle', () => {
  it('handles null input', () => {
    expect(postProcessBundle(null)).toBeNull();
  });

  it('trims the string', () => {
    expect(postProcessBundle(' trimMe(); ')).toStrictEqual('trimMe();');
  });

  it('strips comments', () => {
    [
      ['/* delete me */postProcessMe();', 'postProcessMe();'],
      ['oi();// hello\npostProcessMe();', 'oi();\npostProcessMe();'],
      ['oi();/**********/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      ['oi();/***/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      // We used to have issues with this one and our comment stripping
      ['oi();/**/\npostProcessMe();//hello', 'oi();\npostProcessMe();'],
      ['foo();/** /* **/bar();', 'foo();\nbar();'],
      ['foo();/** /** **/bar();', 'foo();\nbar();'],
    ].forEach(([input, expected]) => {
      expect(postProcessBundle(input)).toStrictEqual(expected);
    });
  });

  it('ignores comments if configured to do so', () => {
    expect(
      postProcessBundle('/* leave me alone */postProcessMe();', {
        stripComments: false,
      }),
    ).toStrictEqual('/* leave me alone */postProcessMe();');
  });

  it('strips HTML comment tokens', () => {
    [
      ['foo();\n<!--', 'foo();'],
      ['-->\nbar()', 'bar();'],
    ].forEach(([input, output]) => {
      expect(
        postProcessBundle(input, {
          stripComments: false,
          transformHtmlComments: false,
        }),
      ).toStrictEqual(input);

      expect(postProcessBundle(input, { stripComments: true })).toStrictEqual(
        output,
      );
    });
  });

  // @todo This should rewrite literals to "<!" + "--"
  it('breaks up HTML comment tokens', () => {
    [
      [`foo('<!--');`, `foo('< !--');`],
      [`const bar = '-->';`, `const bar = '-- >';`],
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
    expect(
      postProcessBundle('var _marked = [a].map(regeneratorRuntime.mark);'),
    ).toStrictEqual(
      'var regeneratorRuntime;\nvar _marked = [a].map(regeneratorRuntime.mark);',
    );
  });

  it('throws an error if the postprocessed string is empty', () => {
    expect(() => postProcessBundle(' ')).toThrow(/^Bundled code is empty/u);
  });
});
