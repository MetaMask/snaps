import { Box } from './Box';
import { Text } from './Text';

describe('Box', () => {
  it('renders a box', () => {
    const result = (
      <Box>
        <Text>Hello</Text>
      </Box>
    );

    expect(result).toStrictEqual({
      type: 'box',
      key: null,
      props: {
        children: {
          type: 'text',
          key: null,
          props: {
            children: 'Hello',
          },
        },
      },
    });
  });

  it('renders a box with multiple children', () => {
    const result = (
      <Box>
        <Text>Hello</Text>
        <Text>World</Text>
      </Box>
    );

    expect(result).toStrictEqual({
      type: 'box',
      key: null,
      props: {
        children: [
          {
            type: 'text',
            key: null,
            props: {
              children: 'Hello',
            },
          },
          {
            type: 'text',
            key: null,
            props: {
              children: 'World',
            },
          },
        ],
      },
    });
  });
});
