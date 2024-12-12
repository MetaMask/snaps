import { is } from '@metamask/superstruct';

import { Box, Image, Input, Row, Text } from '../../components';
import { InputStruct } from './input';

describe('InputStruct', () => {
  it.each([
    <Input name="foo" type="text" />,
    <Input name="foo" type="password" />,
    <Input name="foo" type="number" />,
    <Input name="foo" type="text" value="bar" />,
    <Input name="foo" type="text" placeholder="bar" />,
    <Input name="foo" type="number" min={0} max={10} step={1} />,
  ])('validates an input element', (value) => {
    expect(is(value, InputStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Input />,
    // @ts-expect-error - Invalid props.
    <Input name="foo" type="foo" />,
    // @ts-expect-error - Invalid props.
    <Input name="foo" min="foo" />,
    // @ts-expect-error - Invalid props.
    <Input name="foo" type="text" min={42} />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, InputStruct)).toBe(false);
  });
});
