import { Heading } from './Heading';

describe('Heading', () => {
  it('renders a heading', () => {
    const result = <Heading>Foo</Heading>;

    expect(result).toStrictEqual({
      type: 'Heading',
      key: null,
      props: {
        children: 'Foo',
      },
    });
  });

  it('renders a heading with nested text', () => {
    const result = <Heading>Hello {'world'}!</Heading>;

    expect(result).toStrictEqual({
      type: 'Heading',
      key: null,
      props: {
        children: ['Hello ', 'world', '!'],
      },
    });
  });

  it('renders a heading with a conditional value', () => {
    const result = (
      <Heading>
        Hello
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && 'world'}
      </Heading>
    );

    expect(result).toStrictEqual({
      type: 'Heading',
      key: null,
      props: {
        children: ['Hello', false],
      },
    });
  });

  it('renders a heading with a `lg` size', () => {
    const result = <Heading size="lg">Foo</Heading>;

    expect(result).toStrictEqual({
      type: 'Heading',
      key: null,
      props: {
        children: 'Foo',
        size: 'lg',
      },
    });
  });
});
