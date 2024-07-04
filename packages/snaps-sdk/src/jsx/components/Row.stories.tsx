import type { Meta, Story } from '@metamask/snaps-storybook';

import { Address } from './Address';
import type { RowProps } from './Row';
import { Row } from './Row';
import { Text } from './Text';

const meta: Meta<typeof Row> = {
  title: 'UI/Row',
  component: Row,
  argTypes: {
    label: {
      description: 'The label of the row, shown on the left.',
      table: {
        type: { summary: 'string' },
      },
    },

    children: {
      description:
        'The children of the row, shown on the right. This can be an address, an image, value, or text.',
      table: {
        type: {
          summary: 'AddressElement | ImageElement | TextElement | ValueElement',
        },
      },
    },

    variant: {
      description: 'The variant of the row.',
      options: ['default', 'warning', 'critical'],
      control: {
        type: 'select',
      },
      table: {
        type: { summary: '"default" | "warning" | "critical"' },
        defaultValue: { summary: '"default"' },
      },
    },

    tooltip: {
      description: 'The tooltip text to show on hover.',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

/**
 * The default row, with a label and children.
 */
export const Default: Story<RowProps> = {
  render: (props) => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>,
  },
};

/**
 * A warning row, which indicates a warning. It renders the row with a yellow
 * background.
 */
export const Warning: Story<RowProps> = {
  render: (props) => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Warning text</Text>,
    variant: 'warning',
  },
};

/**
 * A critical row, which indicates a critical issue. It renders the row with a
 * red background.
 */
export const Critical: Story<RowProps> = {
  render: (props) => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Critical text</Text>,
    variant: 'critical',
  },
};

/**
 * A row with a tooltip, which shows the tooltip text on hover. It shows a
 * different icon depending on the variant.
 */
export const Tooltip: Story<RowProps> = {
  name: 'With tooltip',
  render: (props) => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>,
    tooltip: 'Tooltip text',
  },
};

/**
 * A row with an address.
 */
export const WithAddress: Story<RowProps> = {
  name: 'With address',
  render: (props) => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Address address="0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520" />,
  },
};
