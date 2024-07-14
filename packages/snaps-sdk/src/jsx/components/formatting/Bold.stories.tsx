import type { Meta, Story } from '@metamask/snaps-storybook';

import type { BoldProps } from './Bold';
import { Bold } from './Bold';

const meta: Meta<typeof Bold> = {
  title: 'Text/Bold',
  component: Bold,
  argTypes: {
    children: {
      description: 'The text to render in bold.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

/**
 * The bold component renders text in bold. It can be used in combination with
 * other formatting components to create rich text.
 */
export const Default: Story<BoldProps> = {
  render: (props) => <Bold {...props} />,
  args: {
    children: 'I am bold!',
  },
};
