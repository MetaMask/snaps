import { Heading } from './Heading';

describe('Heading', () => {
  it('renders a heading', () => {
    const result = <Heading>Foo</Heading>;

    expect(result).toStrictEqual({
      type: 'heading',
      key: null,
      props: {
        children: 'Foo',
      },
    });
  });

  it('renders a heading with nested text', () => {
    const result = <Heading>Hello {'world'}!</Heading>;

    expect(result).toStrictEqual({
      type: 'heading',
      key: null,
      props: {
        children: ['Hello ', 'world', '!'],
      },
    });
  });
});
