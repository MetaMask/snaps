import { Italic } from './Italic';

describe('Italic', () => {
  it('returns an italic element', () => {
    const result = <Italic>foo</Italic>;

    expect(result).toStrictEqual({
      type: 'Italic',
      props: {
        children: 'foo',
      },
      key: null,
    });
  });

  it('returns an italic element with nested children', () => {
    const result = <Italic>foo {'bar'}</Italic>;

    expect(result).toStrictEqual({
      type: 'Italic',
      props: {
        children: ['foo ', 'bar'],
      },
      key: null,
    });
  });

  it('returns an italic element with a conditional value', () => {
    const result = (
      <Italic>
        Hello
        {false && 'world'}
      </Italic>
    );

    expect(result).toStrictEqual({
      type: 'Italic',
      props: {
        children: ['Hello', false],
      },
      key: null,
    });
  });
});
