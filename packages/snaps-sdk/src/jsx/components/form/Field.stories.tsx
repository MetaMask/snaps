import type { Meta, Story } from '@metamask/snaps-storybook';

import { Button } from './Button';
import type { FieldProps } from './Field';
import { Field } from './Field';
import { Input } from './Input';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  argTypes: {
    label: {
      description: 'The label of the field.',
      control: 'text',
    },
    error: {
      description: 'The error message of the field.',
      control: 'text',
    },
    children: {
      description: 'The form component to render inside the field.',
      table: {
        type: {
          summary:
            '[InputElement, ButtonElement] | DropdownElement | FileInputElement | InputElement | CheckboxElement',
        },
      },
    },
  },
};

export default meta;

/**
 * The field component wraps an input element with a label and optional error
 * message.
 */
export const Default: Story<FieldProps> = {
  render: (props) => <Field {...props} />,
  args: {
    label: 'Field label',
    children: (
      <Input name="input" type="text" placeholder="Input placeholder" />
    ),
  },
};

/**
 * The field component can display an error message.
 */
export const Error: Story<FieldProps> = {
  render: (props) => <Field {...props} />,
  args: {
    label: 'Field label',
    error: 'Field error',
    children: (
      <Input name="input" type="text" placeholder="Input placeholder" />
    ),
  },
};

/**
 * Inputs can be combined with a button, for example, to submit a form, or to
 * perform some action.
 */
export const InputWithButton: Story<FieldProps> = {
  render: (props) => <Field {...props} />,
  args: {
    label: 'Field label',
    children: [
      <Input name="input" type="text" placeholder="Input placeholder" />,
      <Button type="submit">Submit</Button>,
    ],
  },
};
