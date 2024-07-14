import type { Meta, Story } from '@metamask/snaps-storybook';

import type { CardProps } from './Card';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    title: {
      description: 'The title of the card.',
    },
    description: {
      description: 'The description to show below the title.',
    },
    value: {
      description: 'The value to show on the right side.',
    },
    extra: {
      description: 'An additional value to show below the value.',
    },
    image: {
      description:
        'The image to show as part of the card. If provided, this must be an SVG string.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

/**
 * Format a number as a currency.
 *
 * @param value - The value to format.
 * @returns The formatted currency.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * The card component renders a card with a title, description, and value.
 */
export const Default: Story<CardProps> = {
  render: (props) => <Card {...props} />,
  args: {
    title: 'Title',
    description: 'This is a description.',
    value: formatCurrency(1200),
    extra: '0.12 ETH',
  },
};

/**
 * A basic card, with just a title and value.
 */
export const Basic: Story<CardProps> = {
  render: (props) => <Card {...props} />,
  args: {
    title: 'Title',
    value: formatCurrency(1200),
  },
};

/**
 * A card with an image.
 */
export const WithImage: Story<CardProps> = {
  render: (props) => <Card {...props} />,
  args: {
    title: 'Title',
    description: 'This is a description.',
    value: formatCurrency(1200),
    extra: '0.12 ETH',
    image: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <rect width="32" height="32" fill="#cccccc"></rect>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8px" fill="#333333">32x32</text>
      </svg>
    `,
  },
};
