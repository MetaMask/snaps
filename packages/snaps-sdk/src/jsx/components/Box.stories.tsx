import type { Meta, Story } from '@metamask/snaps-storybook';

import type { BoxProps } from './Box';
import { Box } from './Box';
import { Button } from './form';
import { Heading } from './Heading';
import { Text } from './Text';

const meta: Meta<typeof Box> = {
  title: 'Box',
  component: Box,
  argTypes: {
    direction: {
      description: 'The direction in which to lay out the children.',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'vertical',
        },
      },
    },
    alignment: {
      description: 'The alignment of the children in the box.',
      options: ['start', 'center', 'end', 'space-between'],
      control: {
        type: 'select',
      },
      table: {
        defaultValue: {
          summary: 'start',
        },
      },
    },
  },
};

export default meta;

/**
 * The default box, which renders its children in a vertical layout.
 */
export const Vertical: Story<BoxProps> = {
  name: 'Vertical direction',
  render: (props) => (
    <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>
  ),
  args: {
    direction: 'vertical',
  },
};

/**
 * The box with horizontal layout, which renders its children in a horizontal
 * layout (i.e., next to each other instead of on top of each other).
 */
export const Horizontal: Story<BoxProps> = {
  name: 'Horizontal direction',
  render: (props) => (
    <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>
  ),
  args: {
    direction: 'horizontal',
  },
};

/**
 * The box with center alignment, which centers its children.
 */
export const Center: Story<BoxProps> = {
  name: 'Center alignment',
  render: (props) => (
    <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>
  ),
  args: {
    alignment: 'center',
  },
};

/**
 * The box with space-between alignment, which spaces its children evenly.
 *
 * This only works with horizontal direction.
 */
export const SpaceBetween: Story<BoxProps> = {
  name: 'Space between alignment',
  render: (props) => (
    <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>
  ),
  args: {
    direction: 'horizontal',
    alignment: 'space-between',
  },
};
