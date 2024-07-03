import type { Meta, Story } from '@metamask/snaps-storybook';

import type { FooterProps } from './Footer';
import { Footer } from './Footer';
import { Button } from './form';

const meta: Meta<typeof Footer> = {
  title: 'Footer',
  component: Footer,
  argTypes: {
    children: {
      description:
        'The button(s) to render in the footer. If only one button is provided, a cancel button is added automatically.',
      table: {
        type: {
          summary: 'Button | [Button, Button]',
        },
      },
    },
  },
};

export default meta;

/**
 * The footer component one custom button. A cancel button is added
 * automatically if only one button is provided.
 *
 * When the user clicks the first button, the `onUserInput` handler is called
 * with the name of the button (if provided).
 */
export const Default: Story<FooterProps> = {
  render: (props) => <Footer {...props} />,
  args: {
    children: <Button>Submit</Button>,
  },
};

/**
 * The footer component with two custom buttons. If two buttons are provided,
 * no cancel button is added.
 */
export const TwoButtons: Story<FooterProps> = {
  render: (props) => <Footer {...props} />,
  args: {
    children: [<Button>First</Button>, <Button>Second</Button>],
  },
};
