import type { Meta, Story } from '@metamask/snaps-storybook';

import { Box } from './Box';
import type { ContainerProps } from './Container';
import { Container } from './Container';
import { Footer } from './Footer';
import { Button } from './form';
import { Text } from './Text';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  argTypes: {
    children: {
      description: 'The children of the container.',
      table: {
        type: { summary: 'BoxElement | [BoxElement, FooterElement]' },
      },
    },
  },
};

export default meta;

/**
 * The container component does not render anything itself, but it is used to
 * group other components, namely the `Box` and `Footer` components.
 *
 * It can contain a `Box` and a `Footer` or just a `Box`.
 */
export const Default: Story<ContainerProps> = {
  render: (props) => <Container {...props} />,
  args: {
    children: [
      <Box>
        <Text>This is a box containing the main content.</Text>
      </Box>,
      <Footer>
        <Button>Action</Button>
      </Footer>,
    ],
  },
};

/**
 * A container with only a box. In this case the footer will be populated
 * automatically with the default footer.
 */
export const BoxOnly: Story<ContainerProps> = {
  render: (props) => <Container {...props} />,
  args: {
    children: (
      <Box>
        <Text>This is a box containing the main content.</Text>
      </Box>
    ),
  },
};
