import { is } from '@metamask/superstruct';

import { Bold, Box, Image, Row, Text } from '../components';
import { TextStruct } from './text';

describe('TextStruct', () => {
  it.each([
    <Text>foo</Text>,
    <Text alignment="end">foo</Text>,
    <Text>
      Hello, <Bold>world</Bold>
    </Text>,
    <Text size="sm">foo</Text>,
  ])('validates a text element', (value) => {
    expect(is(value, TextStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Text />,
    // @ts-expect-error - Invalid props.
    <Text foo="bar">foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, TextStruct)).toBe(false);
  });
});
