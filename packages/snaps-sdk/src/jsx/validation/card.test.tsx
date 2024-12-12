import { is } from '@metamask/superstruct';

import { Address, Card, Image, Row } from '../components';
import { CardStruct } from './card';

describe('CardStruct', () => {
  it.each([
    <Card
      image="<svg />"
      title="Title"
      description="Description"
      value="$1200"
      extra="0.12 ETH"
    />,
    <Card
      image="<svg />"
      title={
        <Address
          address="0x1234567890123456789012345678901234567890"
          displayName
          avatar={false}
        />
      }
      description="Description"
      value="$1200"
      extra="0.12 ETH"
    />,
  ])('validates a card element', (value) => {
    expect(is(value, CardStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Card />,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, CardStruct)).toBe(false);
  });
});
