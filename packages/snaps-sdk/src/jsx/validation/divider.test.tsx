import { is } from '@metamask/superstruct';

import { Box, Divider, Image, Row, Text } from '../components';
import { DividerStruct } from './divider';

describe('DividerStruct', () => {
  it.each([<Divider />])('validates a divider element', (value) => {
    expect(is(value, DividerStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Divider>foo</Divider>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, DividerStruct)).toBe(false);
  });
});
