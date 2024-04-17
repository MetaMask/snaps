import { Box } from './Box';
import { Text } from './Text';

describe('Box', () => {
  it('renders a box', () => {
    const result = (
      <Box>
        <Text>hello</Text>
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
            children: 'hello',
          },
        },
      },
    });
  });
});
