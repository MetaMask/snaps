import type { Meta, Story } from '@metamask/snaps-storybook';

import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
};

export default meta;

/**
 * The spinner component renders a spinner, indicating that the content is
 * loading.
 */
export const Default: Story = {
  render: () => <Spinner />,
};
