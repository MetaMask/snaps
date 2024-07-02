import type { Meta, Story } from '@metamask/snaps-storybook';

import type { HeadingProps } from './Heading';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Heading',
  component: Heading,
};

export default meta;

/**
 * The default heading, with text. It can be used to display a title or section
 * header.
 *
 * This is currently the only variant.
 */
export const Default: Story<HeadingProps> = {
  render: (props) => <Heading {...props} />,
  args: {
    children: 'Heading',
  },
};
