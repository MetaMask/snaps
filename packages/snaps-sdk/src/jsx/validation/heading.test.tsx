import { is } from '@metamask/superstruct';

import { Box, Heading, Image, Row, Text } from '../components';
import { HeadingStruct } from './heading';

describe('HeadingStruct', () => {
  it.each([<Heading>Hello</Heading>, <Heading size="lg">Hello</Heading>])(
    'validates a heading element',
    (value) => {
      expect(is(value, HeadingStruct)).toBe(true);
    },
  );

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Heading />,
    <Heading>
      {/* @ts-expect-error - Invalid props. */}
      <Text>foo</Text>
    </Heading>,
    <Box>
      <Text>Hello</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, HeadingStruct)).toBe(false);
  });
});
