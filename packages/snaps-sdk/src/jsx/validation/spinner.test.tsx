import { is } from '@metamask/superstruct';

import { Box, Image, Row, Spinner, Text } from '../components';
import { SpinnerStruct } from './spinner';

describe('SpinnerStruct', () => {
  it.each([<Spinner />])('validates a spinner element', (value) => {
    expect(is(value, SpinnerStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Spinner>foo</Spinner>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, SpinnerStruct)).toBe(false);
  });
});
