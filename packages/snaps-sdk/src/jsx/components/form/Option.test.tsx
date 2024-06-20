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

  it('renders a dropdown option with a conditional value', () => {
    const result = (
      <Option value="foo">
        Foo
        {false && <span>Bar</span>}
      </Option>
    );

    expect(result).toStrictEqual({
      type: 'Option',
      props: {
        value: 'foo',
        children: ['Foo', false],
      },
      key: null,
    });
  });
});
