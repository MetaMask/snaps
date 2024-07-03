import type { Meta, Story } from '@metamask/snaps-storybook';

import { Box } from './Box';
import { Divider } from './Divider';
import { Text } from './Text';

const meta: Meta<typeof Divider> = {
  title: 'Divider',
  component: Divider,
};

export default meta;

/**
 * The divider component renders a horizontal line between elements.
 */
export const Default: Story = {
  render: () => <Divider />,
};

/**
 * It can be used to separate sections of content.
 */
export const WithText: Story = {
  render: () => (
    <Box>
      <Text>Some text</Text>
      <Divider />
      <Text>Some more text</Text>
    </Box>
  ),
};
