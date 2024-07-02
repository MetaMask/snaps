import type { Meta, Story } from '@metamask/snaps-storybook';

import type { AddressProps } from './Address';
import { Address } from './Address';

const meta: Meta<typeof Address> = {
  title: 'Address',
  component: Address,
  argTypes: {
    address: {
      description:
        'The address to display. This must be a valid Ethereum address starting with `0x`.',
      table: {
        // eslint-disable-next-line no-template-curly-in-string
        type: { summary: '`0x${string}`' },
      },
    },
  },
};

export default meta;

/**
 * The address component renders an (Ethereum) address.
 */
export const Default: Story<AddressProps> = {
  render: (props) => <Address {...props} />,
  args: {
    address: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
  },
};
