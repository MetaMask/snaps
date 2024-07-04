import type { Meta, Story } from '@metamask/snaps-storybook';

import type { DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Field } from './Field';
import { Option } from './Option';

const meta: Meta<typeof Dropdown> = {
  title: 'Forms/Dropdown',
  component: Dropdown,
  argTypes: {
    value: {
      description: 'The selected value of the dropdown.',
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    name: {
      description:
        'The name of the dropdown field. This is used to identify the state in the form data.',
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    children: {
      description: 'The dropdown options.',
      table: {
        type: {
          summary: 'OptionElement | OptionElement[]',
        },
      },
    },
  },
};

export default meta;

/**
 * The dropdown component renders a dropdown input field, which allows users to
 * select an option from a list of options.
 */
export const Default: Story<DropdownProps> = {
  render: (props) => <Dropdown {...props} />,
  args: {
    name: 'dropdown-name',
    children: [
      <Option value="option-1">Option 1</Option>,
      <Option value="option-2">Option 2</Option>,
      <Option value="option-3">Option 3</Option>,
    ],
  },
};

/**
 * The dropdown component can be used within a field component to render a
 * dropdown input field with a label, and optional error message.
 */
export const WithinField: Story<DropdownProps> = {
  render: (props) => (
    <Field label="Dropdown">
      <Dropdown {...props} />
    </Field>
  ),
  args: {
    name: 'dropdown-name',
    children: [
      <Option value="option-1">Option 1</Option>,
      <Option value="option-2">Option 2</Option>,
      <Option value="option-3">Option 3</Option>,
    ],
  },
};
