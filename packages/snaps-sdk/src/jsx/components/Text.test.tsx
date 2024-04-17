import { Text } from './Text';

describe('Text', () => {
  it('renders text', () => {
    const result = <Text>Foo</Text>;

    expect(result).toStrictEqual({
      type: 'text',
      key: null,
      props: {
        children: 'Foo',
      },
    });
  });

  it('renders text with nested text', () => {
    const result = <Text>Hello {'world'}!</Text>;

    expect(result).toStrictEqual({
      type: 'text',
      key: null,
      props: {
        children: ['Hello ', 'world', '!'],
      },
    });
  });
});
