import type { Meta, Story } from '@metamask/snaps-storybook';

import type { CopyableProps } from './Copyable';
import { Copyable } from './Copyable';

const meta: Meta<typeof Copyable> = {
  title: 'UI/Copyable',
  component: Copyable,
  argTypes: {
    value: {
      description: 'The value to display.',
      table: {
        type: { summary: 'string' },
      },
    },

    sensitive: {
      description: 'Whether the value is sensitive and should be obscured.',
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: { summary: 'boolean' },
      },
    },
  },
};

export default meta;

/**
 * The copyable component renders a value which can be copied to the clipboard.
 * It can also be used to display raw data.
 */
export const Default: Story<CopyableProps> = {
  render: (props) => <Copyable {...props} />,
  args: {
    value: 'This is a copyable value.',
  },
};

/**
 * Values can be sensitive, in which case they are obscured until the user
 * reveals them.
 */
export const Sensitive: Story<CopyableProps> = {
  render: (props) => <Copyable {...props} />,
  args: {
    sensitive: true,
    value: 'This is a copyable value.',
  },
};

/**
 * For long values, the copyable component will truncate the value and show a
 * "more" button to expand the value.
 */
export const LongValue: Story<CopyableProps> = {
  render: (props) => <Copyable {...props} />,
  args: {
    value: `0x${'4bbeEB066eD09B7AEd07bF39EEe0460DFa261520'.repeat(20)}`,
  },
};
