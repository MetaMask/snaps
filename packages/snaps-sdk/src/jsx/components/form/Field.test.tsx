import { Button } from './Button';
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
});
