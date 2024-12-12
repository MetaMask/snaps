import { is } from '@metamask/superstruct';

import { Box, Image, Row, Text } from '../components';
import { ImageStruct } from './image';

describe('ImageStruct', () => {
  it.each([<Image src="<svg />" alt="alt" />, <Image src="<svg />" />])(
    'validates an image element',
    (value) => {
      expect(is(value, ImageStruct)).toBe(true);
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
    <Image />,
    // @ts-expect-error - Invalid props.
    <Image src="<svg />" alt={42} />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ImageStruct)).toBe(false);
  });
});
