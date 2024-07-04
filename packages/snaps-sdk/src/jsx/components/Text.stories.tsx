import type { Meta, Story } from '@metamask/snaps-storybook';

import { Bold, Italic } from './formatting';
import { Link } from './Link';
import type { TextProps } from './Text';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Text/Text',
  component: Text,
  argTypes: {
    children: {
      description: 'The text to render.',
      table: {
        type: {
          summary:
            'SnapsChildren<string | StandardFormattingElement | LinkElement>',
        },
      },
    },
  },
};

export default meta;

/**
 * The text component renders text. It can be used in combination with other
 * formatting components to create rich text.
 */
export const Default: Story<TextProps> = {
  render: (props) => <Text {...props} />,
  args: {
    children: 'This is some text.',
  },
};

/**
 * Text can contain formatting components (like `Bold` and `Italic`) to create
 * rich text.
 */
export const Formatting: Story<TextProps> = {
  render: (props) => (
    <Text {...props}>
      This is some <Bold>bold</Bold> and <Italic>italic</Italic> text.
    </Text>
  ),
  args: {},
};

/**
 * Text can contain links.
 */
export const WithLink: Story<TextProps> = {
  render: (props) => (
    <Text {...props}>
      This is some text with a link:{' '}
      <Link href="https://metamask.io">metamask.io</Link>.
    </Text>
  ),
  args: {},
};
