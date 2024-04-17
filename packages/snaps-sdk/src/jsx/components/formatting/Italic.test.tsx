import { Italic } from './Italic';

describe('Italic', () => {
  it('returns an italic element', () => {
    const result = <Italic>foo</Italic>;

    expect(result).toStrictEqual({
      type: 'italic',
      props: {
        children: 'foo',
      },
      key: null,
    });
  });

  it('returns an italic element with nested children', () => {
    const result = <Italic>foo {'bar'}</Italic>;

    expect(result).toStrictEqual({
      type: 'italic',
      props: {
        children: ['foo ', 'bar'],
      },
      key: null,
    });
  });
});
