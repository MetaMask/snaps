import type { Meta, Story } from '@metamask/snaps-storybook';

import { Bold, Italic } from './formatting';
import type { LinkProps } from './Link';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Text/Link',
  component: Link,
  argTypes: {
    href: {
      description: 'The URL to link to.',
      control: 'text',
    },
    children: {
      description:
        'The text to display in the link. This can contain formatting components.',
      control: 'text',
    },
  },
};

export default meta;

/**
 * The link component renders a hyperlink, and an icon to indicate that the link
 * will open in a new tab.
 */
export const Default: Story<LinkProps> = {
  render: (props) => <Link {...props} />,
  args: {
    href: 'https://metamask.io',
    children: 'MetaMask',
  },
};

/**
 * Links can contain the usual formatting components, such as `Bold` and
 * `Italic`.
 */
export const Formatting: Story<LinkProps> = {
  render: (props) => <Link {...props} />,
  args: {
    href: 'https://metamask.io',
    children: (
      <Bold>
        Formatted <Italic>link</Italic>
      </Bold>
    ),
  },
};
