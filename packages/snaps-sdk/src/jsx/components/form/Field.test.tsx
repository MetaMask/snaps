import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { DropdownOption } from './DropdownOption';
import { Field } from './Field';
import { Input } from './Input';

describe('Field', () => {
  it('renders a field element', () => {
    const result = (
      <Field label="Label">
        <Input name="foo" type="text" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'Input',
          key: null,
          props: {
            name: 'foo',
            type: 'text',
          },
        },
      },
    });
  });

  it('renders a field element with an error', () => {
    const result = (
      <Field label="Label" error="Error">
        <Input name="foo" type="text" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        error: 'Error',
        children: {
          type: 'Input',
          key: null,
          props: {
            name: 'foo',
            type: 'text',
          },
        },
      },
    });
  });

  it('renders a field element with an input and a button', () => {
    const result = (
      <Field label="Label">
        <Input name="foo" type="text" />
        <Button type="submit">Submit</Button>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: [
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
              type: 'text',
            },
          },
          {
            type: 'Button',
            key: null,
            props: {
              type: 'submit',
              children: 'Submit',
            },
          },
        ],
      },
    });
  });

  it('renders a dropdown element', () => {
    const result = (
      <Field label="Label">
        <Dropdown name="foo">
          <DropdownOption value="option1">Option 1</DropdownOption>
          <DropdownOption value="option2">Option 2</DropdownOption>
        </Dropdown>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'Dropdown',
          key: null,
          props: {
            name: 'foo',
            children: [
              {
                type: 'DropdownOption',
                key: null,
                props: {
                  children: 'Option 1',
                  value: 'option1',
                },
              },
              {
                type: 'DropdownOption',
                key: null,
                props: {
                  children: 'Option 2',
                  value: 'option2',
                },
              },
            ],
          },
        },
      },
    });
  });
});
