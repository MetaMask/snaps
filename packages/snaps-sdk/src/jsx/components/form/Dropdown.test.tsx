import { Dropdown } from './Dropdown';
import { Option } from './Option';

describe('Dropdown', () => {
  it('renders a dropdown with options', () => {
    const result = (
      <Dropdown name="dropdown" value="foo">
        <Option value="foo">Foo</Option>
        <Option value="bar">Bar</Option>
      </Dropdown>
    );

    expect(result).toStrictEqual({
      type: 'Dropdown',
      props: {
        name: 'dropdown',
        value: 'foo',
        children: [
          {
            type: 'Option',
            props: {
              value: 'foo',
              children: 'Foo',
            },
            key: null,
          },
          {
            type: 'Option',
            props: {
              value: 'bar',
              children: 'Bar',
            },
            key: null,
          },
        ],
      },
      key: null,
    });
  });

  it('renders a dropdown with a conditional option', () => {
    const result = (
      <Dropdown name="dropdown" value="foo">
        <Option value="foo">Foo</Option>
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && <Option value="bar">Bar</Option>}
      </Dropdown>
    );

    expect(result).toStrictEqual({
      type: 'Dropdown',
      props: {
        name: 'dropdown',
        value: 'foo',
        children: [
          {
            type: 'Option',
            props: {
              value: 'foo',
              children: 'Foo',
            },
            key: null,
          },
          false,
        ],
      },
      key: null,
    });
  });

  it('renders disabled dropdown with options', () => {
    const result = (
      <Dropdown name="dropdown" value="foo" disabled={true}>
        <Option value="foo">Foo</Option>
        <Option value="bar">Bar</Option>
      </Dropdown>
    );

    expect(result).toStrictEqual({
      type: 'Dropdown',
      props: {
        name: 'dropdown',
        value: 'foo',
        disabled: true,
        children: [
          {
            type: 'Option',
            props: {
              value: 'foo',
              children: 'Foo',
            },
            key: null,
          },
          {
            type: 'Option',
            props: {
              value: 'bar',
              children: 'Bar',
            },
            key: null,
          },
        ],
      },
      key: null,
    });
  });
});
