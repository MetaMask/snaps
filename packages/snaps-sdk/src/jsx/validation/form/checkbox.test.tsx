import { is } from '@metamask/superstruct';

import { Box, Checkbox, Image, Row, Spinner, Text } from '../../components';
import { CheckboxStruct } from './checkbox';

describe('CheckboxStruct', () => {
  it.each([
    <Checkbox name="foo" />,
    <Checkbox name="foo" checked={true} />,
    <Checkbox name="foo" checked={true} label="Foo" variant="toggle" />,
  ])('validates a dropdown element', (value) => {
    expect(is(value, CheckboxStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Spinner>foo</Spinner>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, CheckboxStruct)).toBe(false);
  });
});
