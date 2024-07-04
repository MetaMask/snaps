import type { Meta, Story } from '@metamask/snaps-storybook';

import type { ButtonProps } from './Button';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Forms/Button',
  component: Button,
  argTypes: {
    type: {
      description:
        'The type of the button. If set to "submit", the button will submit the form.',
      options: ['button', 'submit'],
      control: 'select',
      table: {
        type: {
          summary: '"button" | "submit"',
        },
        defaultValue: {
          summary: '"button"',
        },
      },
    },
    variant: {
      description: 'The variant of the button.',
      options: ['primary', 'destructive'],
      control: 'select',
      table: {
        type: {
          summary: '"primary" | "destructive"',
        },
        defaultValue: {
          summary: '"primary"',
        },
      },
    },
    disabled: {
      description: 'Whether the button is disabled.',
      control: 'boolean',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    children: {
      description: 'The label of the button.',
      control: 'text',
    },
  },
};

export default meta;

/**
 * The button component renders a clickable button. When clicked, the button
 * emits an event that can be handled by the `onUserInput` handler.
 */
export const Default: Story<ButtonProps> = {
  render: (props) => <Button {...props} />,
  args: {
    name: 'button-name',
    children: 'Button',
  },
};

/**
 * The button component has a destructive variant, which can be used to indicate
 * that the action triggered by the button is destructive or irreversible, or to
 * indicate that the user should proceed with caution.
 */
export const Destructive: Story<ButtonProps> = {
  render: (props) => <Button {...props} />,
  args: {
    name: 'button-name',
    variant: 'destructive',
    children: 'Button',
  },
};

/**
 * The button component can be disabled.
 */
export const Disabled: Story<ButtonProps> = {
  render: (props) => <Button {...props} />,
  args: {
    name: 'button-name',
    disabled: true,
    children: 'Button',
  },
};
