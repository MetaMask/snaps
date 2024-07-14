import type { Meta, Story } from '@metamask/snaps-storybook';

import type { ValueProps } from './Value';
import { Value } from './Value';

const meta: Meta<typeof Value> = {
  title: 'UI/Value',
  component: Value,
  argTypes: {
    value: {
      description: 'The value to display.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    extra: {
      description: 'The extra meta data to display.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
  },
};

export default meta;

/**
 * The value component renders a value with extra meta data. It can be used to
 * display some data with a description, like an ETH value with a USD value.
 */
export const Default: Story<ValueProps> = {
  render: (props) => <Value {...props} />,
  args: {
    value: '$1200.00',
    extra: '0.12 ETH',
  },
};
