import type { Meta, Story } from '@metamask/snaps-storybook';

import type { CheckboxProps } from './Checkbox';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  argTypes: {
    name: {
      description:
        'The name of the checkbox field. This is used to identify the state in the form data.',
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    label: {
      description: 'The label of the checkbox.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    checked: {
      description: 'Whether the checkbox is checked or not.',
      control: 'boolean',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    variant: {
      description: 'The variant of the checkbox.',
      options: ['default', 'toggle'],
      control: {
        type: 'select',
      },
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: '"default"',
        },
      },
    },
  },
};

export default meta;

/**
 * The checkbox component renders a checkbox input field, which allows users to
 * select an option from a list of options.
 */
export const Default: Story<CheckboxProps> = {
  render: (props) => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox',
  },
};

/**
 * The checkbox can be checked by default.
 */
export const Checked: Story<CheckboxProps> = {
  render: (props) => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox',
    checked: true,
  },
};

/**
 * The checkbox can be rendered as a toggle switch.
 */
export const Toggle: Story<CheckboxProps> = {
  render: (props) => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox',
    variant: 'toggle',
  },
};
