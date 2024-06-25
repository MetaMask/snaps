import { Option } from './Option';

describe('Option', () => {
  it('renders a dropdown option', () => {
    const result = <Option value="foo">Foo</Option>;

    expect(result).toStrictEqual({
      type: 'Option',
      props: {
        value: 'foo',
        children: 'Foo',
      },
      key: null,
    });
  });
});
