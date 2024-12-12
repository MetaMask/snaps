import { is } from '@metamask/superstruct';

import { Bold, Box, Image, Italic, Row, Text } from '../components';
import { BoldStruct, ItalicStruct } from './formatting';

describe('BoldStruct', () => {
  it.each([<Bold>hello</Bold>])('validates a bold element', (value) => {
    expect(is(value, BoldStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Bold />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, BoldStruct)).toBe(false);
  });
});

describe('ItalicStruct', () => {
  it.each([<Italic>hello</Italic>, <Italic key="italic">hello</Italic>])(
    'validates an italic element',
    (value) => {
      expect(is(value, ItalicStruct)).toBe(true);
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
    <Italic />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ItalicStruct)).toBe(false);
  });
});
