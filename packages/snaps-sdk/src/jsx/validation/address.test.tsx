import { is } from '@metamask/superstruct';

import { Address, Box, Image, Row, Text } from '../components';
import { AddressStruct } from './address';

describe('AddressStruct', () => {
  it.each([
    <Address address="0x1234567890abcdef1234567890abcdef12345678" />,
    <Address address="eip155:1:0x1234567890abcdef1234567890abcdef12345678" />,
    <Address address="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />,
    <Address address="cosmos:cosmoshub-3:cosmos1t2uflqwqe0fsj0shcfkrvpukewcw40yjj6hdc0" />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      truncate={false}
      avatar={false}
    />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      displayName={true}
    />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      displayName={true}
      avatar={false}
    />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      truncate={true}
      displayName={false}
      avatar={true}
    />,
  ])('validates an address element', (value) => {
    expect(is(value, AddressStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Address />,
    // @ts-expect-error - Invalid props.
    <Address>
      <Text>foo</Text>
    </Address>,
    <Address address="0x1234" />,
    <Address address="a:b:0x1234" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      // @ts-expect-error - Invalid props.
      truncate="wrong-prop"
    />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      // @ts-expect-error - Invalid props.
      displayName="false"
    />,
    <Address
      address="0x1234567890abcdef1234567890abcdef12345678"
      // @ts-expect-error - Invalid props.
      avatar="wrong-prop"
    />,
  ])('does not validate "%p"', (value) => {
    expect(is(value, AddressStruct)).toBe(false);
  });
});
