import { is } from '@metamask/superstruct';

import { Box, Copyable, Image, Row, Text } from '../components';
import { CopyableStruct } from './copyable';

describe('CopyableStruct', () => {
  it.each([
    <Copyable value="foo" />,
    <Copyable value="bar" sensitive={true} />,
  ])('validates a copyable element', (value) => {
    expect(is(value, CopyableStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Copyable />,
    // @ts-expect-error - Invalid props.
    <Copyable>foo</Copyable>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, CopyableStruct)).toBe(false);
  });
});
