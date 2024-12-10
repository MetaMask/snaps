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

  it('returns a button element with a form', () => {
    const result = <Button form="foo">bar</Button>;

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: 'bar',
        form: 'foo',
      },
      key: null,
    });
  });

  it('returns a button element with a variant and loading state', () => {
    const result = (
      <Button type="button" variant="primary" loading={true}>
        foo
      </Button>
    );

    expect(result).toStrictEqual({
      type: 'Button',
      props: {
        children: 'foo',
        type: 'button',
        variant: 'primary',
        loading: true,
      },
      key: null,
    });
  });
});
