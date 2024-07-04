import type { Meta, Story } from '@metamask/snaps-storybook';

import type { InputProps } from './Input';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  argTypes: {
    name: {
      description:
        'The name of the input field. This is used to identify the input field in the form data.',
    },
    type: {
      description: 'The type of the input field.',
      options: ['text', 'password', 'number'],
      control: 'select',
    },
    value: {
      description: 'The default value of the input field.',
      control: 'text',
    },
    placeholder: {
      description: 'The placeholder text of the input field.',
      control: 'text',
    },
  },
};

export default meta;

/**
 * The input component renders an input field.
 */
export const Default: Story<InputProps> = {
  render: (props) => <Input {...props} />,
  args: {
    name: 'input',
    placeholder: 'This is the placeholder text',
  },
};

/**
 * Number inputs only accept numbers.
 */
export const Number: Story<InputProps> = {
  render: (props) => <Input {...props} />,
  args: {
    name: 'input',
    type: 'number',
    placeholder: 'This input only accepts numbers',
  },
};

/**
 * Password inputs hide the entered text.
 */
export const Password: Story<InputProps> = {
  render: (props) => <Input {...props} />,
  args: {
    name: 'input',
    type: 'password',
    placeholder: 'This is a password input',
  },
};

/**
 * It's possible to set a default value for the input. The value can be changed
 * by the user.
 */
export const DefaultValue: Story<InputProps> = {
  render: (props) => <Input {...props} />,
  args: {
    name: 'input',
    value: 'Default value',
    placeholder: 'This input has a default value',
  },
};
