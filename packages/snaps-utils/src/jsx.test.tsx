// eslint-disable-next-line @typescript-eslint/no-shadow
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
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

  it('calls the callback on each node in an array of nodes', () => {
    const tree = [
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>,
      <Text>World</Text>,
    ];

    const callback = jest.fn();
    walkJsx(tree, callback);

    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenCalledWith(tree[0]);
    expect(callback).toHaveBeenCalledWith(tree[0].props.children[0]);
    expect(callback).toHaveBeenCalledWith(
      tree[0].props.children[0].props.children,
    );
    expect(callback).toHaveBeenCalledWith(tree[0].props.children[1]);
    expect(callback).toHaveBeenCalledWith(tree[1]);
  });

  it("returns the result of the callback if it's not undefined", () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn((element: JSXElement) => {
      if (element.type === 'Text') {
        return element.props.children;
      }

      return undefined;
    });

    const result = walkJsx(tree, callback);
    expect(result).toBe('Hello');
  });

  it('returns the result of the callback if it is not undefined in an array of nodes', () => {
    const tree = [
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>,
      <Text>World</Text>,
    ];

    const callback = jest.fn((element: JSXElement) => {
      if (element.type === 'Text') {
        return element.props.children;
      }

      return undefined;
    });

    const result = walkJsx(tree, callback);
    expect(result).toBe('Hello');
  });

  it('returns undefined if the callback never returns a value', () => {
    const tree = (
      <Box>
        <Row label="row">
          <Text>Hello</Text>
        </Row>
        <Image src="<svg />" />
      </Box>
    );

    const callback = jest.fn();
    const result = walkJsx(tree, callback);
    expect(result).toBeUndefined();
  });
});
