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
          <Button type="submit">Submit</Button>
        </Field>
      </Form>
    );

    expect(result).toStrictEqual({
      type: 'form',
      key: null,
      props: {
        name: 'my-form',
        children: {
          type: 'field',
          key: null,
          props: {
            label: 'Username',
            children: [
              {
                type: 'input',
                key: null,
                props: {
                  name: 'username',
                  type: 'text',
                },
              },
              {
                type: 'button',
                key: null,
                props: {
                  type: 'submit',
                  children: 'Submit',
                },
              },
            ],
          },
        },
      },
    });
  });
});
