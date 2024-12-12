import { is } from '@metamask/superstruct';

import { Address, Box, Icon, Image, Link, Row, Text } from '../components';
import { LinkStruct } from './link';

describe('LinkStruct', () => {
  it.each([
    <Link href="https://example.com">foo</Link>,
    <Link href="metamask://client/">
      <Icon name="arrow-left" size="md" />
    </Link>,
    <Link href="https://example.com">
      <Address address="0x1234567890123456789012345678901234567890" />
    </Link>,
  ])('validates a link element', (value) => {
    expect(is(value, LinkStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Link />,
    // @ts-expect-error - Invalid props.
    <Link href={42}>foo</Link>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    <Row label="label">
      <Link href="https://example.com">
        <Address address="0x1234567890123456789012345678901234567890" />
      </Link>
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, LinkStruct)).toBe(false);
  });
});
