import { is } from '@metamask/superstruct';

import { Box, Image, Row, Text, Value } from '../components';
import { ValueStruct } from './value';

describe('ValueStruct', () => {
  it.each([<Value extra="foo" value="bar" />])(
    'validates a value element',
    (value) => {
      expect(is(value, ValueStruct)).toBe(true);
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
    <Value />,
    // @ts-expect-error - Invalid props.
    <Value left="foo" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ValueStruct)).toBe(false);
  });
});
