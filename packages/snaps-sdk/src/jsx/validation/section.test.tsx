import { is } from '@metamask/superstruct';

import { Address, Box, Image, Row, Section, Text } from '../components';
import { SectionStruct } from './section';

describe('SectionStruct', () => {
  it.each([
    <Section>
      <Box>
        <Text>Hello world!</Text>
      </Box>
    </Section>,
    <Section>
      <Row label="From">
        <Address address="0x1234567890123456789012345678901234567890" />
      </Row>
      <Row
        label="To"
        variant="warning"
        tooltip="This address has been deemed dangerous."
      >
        <Address address="0x0000000000000000000000000000000000000000" />
      </Row>
    </Section>,
    <Section direction="horizontal" alignment="space-between">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Section>,
    <Section direction="horizontal">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Section>,
  ])('validates a section element', (value) => {
    expect(is(value, SectionStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Section />,
    // @ts-expect-error - Invalid props.
    <Section></Section>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    // @ts-expect-error - Invalid props.
    <Section direction="diagonal">
      <Box>
        <Text>Hello world!</Text>
      </Box>
    </Section>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, SectionStruct)).toBe(false);
  });
});
