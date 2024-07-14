import type { Meta, Story } from '@metamask/snaps-storybook';

import { Heading } from '../Heading';
import { Text } from '../Text';
import { Field } from './Field';
import type { FormProps } from './Form';
import { Form } from './Form';
import { Input } from './Input';

const meta: Meta<typeof Form> = {
  title: 'Forms/Form',
  component: Form,
  argTypes: {
    name: {
      description:
        'The name of the form. This is used to identify form in the `onUserInput` event.',
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    children: {
      description: 'The form children.',
      table: {
        type: {
          summary: 'JSXElement | JSXElement[]',
        },
      },
    },
  },
};

export default meta;

/**
 * The form component does not render anything by itself, but it can be used to
 * group form elements together.
 */
export const Default: Story<FormProps> = {
  render: (props) => <Form {...props} />,
  args: {
    name: 'form-name',
    children: [
      <Heading>Log in</Heading>,
      <Text>Enter your username and password to proceed.</Text>,
      <Field label="Username">
        <Input name="username" type="text" />
      </Field>,
      <Field label="Password">
        <Input name="password" type="password" />
      </Field>,
    ],
  },
};
