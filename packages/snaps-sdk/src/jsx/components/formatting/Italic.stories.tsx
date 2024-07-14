import type { Meta, Story } from '@metamask/snaps-storybook';

import type { ItalicProps } from './Italic';
import { Italic } from './Italic';

const meta: Meta<typeof Italic> = {
  title: 'Text/Italic',
  component: Italic,
  argTypes: {
    children: {
      description: 'The text to render in italic.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

/**
 * The italic component renders text in italic. It can be used in combination with
 * other formatting components to create rich text.
 */
export const Default: Story<ItalicProps> = {
  render: (props) => <Italic {...props} />,
  args: {
    children: 'I am italic!',
  },
};
