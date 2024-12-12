import { is } from '@metamask/superstruct';

import { Address, Bold, Box, Image, Row, Text, Value } from '../components';
import { RowStruct } from './row';

describe('RowStruct', () => {
  it.each([
    <Row label="label">
      <Text>foo</Text>
    </Row>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    <Row label="label" variant="default">
      <Address address="0x1234567890abcdef1234567890abcdef12345678" />
    </Row>,
    <Row label="label" variant="default">
      <Value extra="foo" value="bar" />
    </Row>,
    <Row label="label" variant="default" tooltip="This is a tooltip.">
      <Value extra="foo" value="bar" />
    </Row>,
  ])('validates a row element', (value) => {
    expect(is(value, RowStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Row />,
    <Row label="label">
      <Bold>foo</Bold>
    </Row>,
    // @ts-expect-error - Invalid props.
    <Row label="label" variant="foo">
      <Text>foo</Text>
    </Row>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, RowStruct)).toBe(false);
  });
});
