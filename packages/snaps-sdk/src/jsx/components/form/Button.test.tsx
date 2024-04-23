import { Button } from './Button';

describe('Button', () => {
  it('returns a button element', () => {
    const result = <Button>foo</Button>;

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: 'foo',
      },
      key: null,
    });
  });

  it('returns a button element with nested children', () => {
    const result = <Button>foo {'bar'}</Button>;

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: ['foo ', 'bar'],
      },
      key: null,
    });
  });

  it('returns a button element with a name', () => {
    const result = <Button name="foo">foo</Button>;

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: 'foo',
        name: 'foo',
      },
      key: null,
    });
  });

  it('returns a button element with a type', () => {
    const result = <Button type="button">foo</Button>;

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: 'foo',
        type: 'button',
      },
      key: null,
    });
  });
});
