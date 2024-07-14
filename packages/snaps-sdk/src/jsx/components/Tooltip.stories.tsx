import type { Meta, Story } from '@metamask/snaps-storybook';

import { Bold, Italic } from './formatting';
import { Text } from './Text';
import type { TooltipProps } from './Tooltip';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  argTypes: {
    content: {
      description: 'The element to display in the tooltip.',
      table: {
        type: {
          summary:
            'TextElement | StandardFormattingElement | LinkElement | string',
        },
      },
    },
    children: {
      description:
        'The children to render outside the tooltip, which will trigger the tooltip when hovered over.',
      table: {
        type: {
          summary:
            'TextElement | StandardFormattingElement | LinkElement | ImageElement | boolean | null',
        },
      },
    },
  },
};

export default meta;

/**
 * The tooltip component shows a tooltip when hovering over the children, like
 * text, a link, or an image.
 */
export const Default: Story<TooltipProps> = {
  render: (props) => <Tooltip {...props} />,
  args: {
    content: <Text>Tooltip content.</Text>,
    children: <Text>Hover me!</Text>,
  },
};

/**
 * The tooltip component can contain text with formatting, like bold and italic
 * text.
 */
export const Formatting: Story<TooltipProps> = {
  render: (props) => <Tooltip {...props} />,
  args: {
    content: (
      <Text>
        Tooltips can contain <Bold>bold</Bold> and <Italic>italic</Italic> text
        as well.
      </Text>
    ),
    children: <Text>Hover me!</Text>,
  },
};
