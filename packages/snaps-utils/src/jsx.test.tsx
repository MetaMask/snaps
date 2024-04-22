// eslint-disable-next-line @typescript-eslint/no-shadow
import { Box, Image, Row, Text } from '@metamask/snaps-sdk/jsx';

import { walkJsx } from './jsx';

describe('walk', () => {
  it('calls the callback on each node', () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn();
    walkJsx(tree, callback);

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledWith(tree);
    expect(callback).toHaveBeenCalledWith(tree.props.children[0]);
    expect(callback).toHaveBeenCalledWith(
      tree.props.children[0].props.children,
    );
    expect(callback).toHaveBeenCalledWith(tree.props.children[1]);
  });
});
