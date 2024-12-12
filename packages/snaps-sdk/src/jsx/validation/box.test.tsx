import { is } from '@metamask/superstruct';

import { Box, Field, Image, Input, Row, Text, Value } from '../components';
import { BoxStruct } from './box';

describe('BoxStruct', () => {
  it.each([
    <Box>
      <Text>foo</Text>
    </Box>,
    <Box>
      <Text>foo</Text>
      <Text>bar</Text>
    </Box>,
    <Box>
      <Field label="foo">
        <Input name="foo" />
      </Field>
    </Box>,
    <Box>
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Box>,
    <Box direction="horizontal" alignment="space-between">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Box>,
    <Box direction="horizontal">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Box>,
    <Box>
      <Text>Foo</Text>
      {[1, 2, 3, 4, 5].map((value) => (
        <Text>{value.toString()}</Text>
      ))}
    </Box>,
  ])('validates a box element', (value) => {
    expect(is(value, BoxStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    <Text>foo</Text>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    // @ts-expect-error - Invalid props.
    <Box direction="foo">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Box>,
    // @ts-expect-error - Invalid props.
    <Box direction="vertical" alignment="foo">
      <Text>foo</Text>
      <Row label="label">
        <Image src="<svg />" alt="alt" />
      </Row>
    </Box>,
    <Box>
      <Value extra="foo" value="bar" />
    </Box>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, BoxStruct)).toBe(false);
  });
});
