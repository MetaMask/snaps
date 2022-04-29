import { Readable } from 'stream';
import concat from 'concat-stream';
import { getTransform, postProcess } from './bundle';

const toStream = (value: string) => {
  const readable = new Readable();
  readable.push(value);
  readable.push(null);

  return readable;
};

describe('getTransform', () => {
  it('returns a transform stream which processes the data', async () => {
    const transform = getTransform('foo', {});
    const stream = toStream(' foo bar ');

    const result = await new Promise((resolve) => {
      const concatStream = concat((value) => resolve(value.toString('utf-8')));

      stream.pipe(transform).pipe(concatStream);
    });

    expect(result).toBe('foo bar');
  });
});

describe('postProcess', () => {
  it('handles null input', () => {
    expect(postProcess(null)).toBeNull();
  });

  it('trims the string', () => {
    expect(postProcess(' trimMe ')).toStrictEqual('trimMe');
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
      expect(postProcess(input)).toStrictEqual(expected);
    });
  });

  it('ignores comments if configured to do so', () => {
    expect(
      postProcess('/* leave me alone */postProcessMe', {
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
        postProcess(input, { transformHtmlComments: false }),
      ).toStrictEqual(input);

      expect(postProcess(input, { transformHtmlComments: true })).toStrictEqual(
        output,
      );
    });
  });

  it('applies regeneratorRuntime hack', () => {
    expect(postProcess('(regeneratorRuntime)')).toStrictEqual(
      'var regeneratorRuntime;\n(regeneratorRuntime)',
    );
  });

  it('throws an error if the postprocessed string is empty', () => {
    expect(() => postProcess(' ')).toThrow(/^Bundled code is empty/u);
  });
});
