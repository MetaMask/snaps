import { Bold } from './Bold';

describe('Bold', () => {
  it('returns a bold element', () => {
    const result = <Bold>foo</Bold>;

    expect(result).toStrictEqual({
      type: 'bold',
      props: {
        children: 'foo',
      },
      key: null,
    });
  });

  it('returns a bold element with nested children', () => {
    const result = <Bold>foo {'bar'}</Bold>;

    expect(result).toStrictEqual({
      type: 'bold',
      props: {
        children: ['foo ', 'bar'],
      },
      key: null,
    });
  });
});
