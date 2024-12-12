import { is } from '@metamask/superstruct';

import { Avatar, Box, Image, Row, Text } from '../components';
import { AvatarStruct } from './avatar';

describe('AvatarStruct', () => {
  it.each([
    <Avatar address="eip155:1:0x1234567890abcdef1234567890abcdef12345678" />,
    <Avatar address="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />,
    <Avatar address="cosmos:cosmoshub-3:cosmos1t2uflqwqe0fsj0shcfkrvpukewcw40yjj6hdc0" />,
    <Avatar
      address="eip155:1:0x1234567890abcdef1234567890abcdef12345678"
      size="lg"
    />,
  ])('validates an avatar element', (value) => {
    expect(is(value, AvatarStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Avatar />,
    // @ts-expect-error - Invalid props.
    <Avatar>
      <Text>foo</Text>
    </Avatar>,
    // @ts-expect-error - Invalid props.
    <Avatar address="0x1234567890abcdef1234567890abcdef12345678" />,
    // @ts-expect-error - Invalid props.
    <Avatar address="0x1234" />,
    <Avatar
      address="eip155:1:0x1234567890abcdef1234567890abcdef12345678"
      // @ts-expect-error - Invalid props.
      size="foo"
    />,
    <Avatar address="a:b:0x1234" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, AvatarStruct)).toBe(false);
  });
});
