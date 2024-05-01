import { Button } from './Button';
import { Field } from './Field';
import { Form } from './Form';
import { Input } from './Input';

describe('Form', () => {
  it('renders a form element', () => {
    const result = (
      <Form name="my-form">
        <Field label="Username">
          <Input name="username" type="text" />
        </Field>
      </Form>
    );

    expect(result).toStrictEqual({
      type: 'Form',
      key: null,
      props: {
        name: 'my-form',
        children: {
          type: 'Field',
          key: null,
          props: {
            label: 'Username',
            children: {
              type: 'Input',
              key: null,
              props: {
                name: 'username',
                type: 'text',
              },
            },
          },
        },
      },
    });
  });

  it('renders a form element with a button', () => {
    const result = (
      <Form name="my-form">
        <Field label="Username">
          <Input name="username" type="text" />
        </Field>
        <Button type="submit">Submit</Button>
      </Form>
    );

    expect(result).toStrictEqual({
      type: 'Form',
      key: null,
      props: {
        name: 'my-form',
        children: [
          {
            type: 'Field',
            key: null,
            props: {
              label: 'Username',
              children: {
                type: 'Input',
                key: null,
                props: {
                  name: 'username',
                  type: 'text',
                },
              },
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
