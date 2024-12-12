import { is } from '@metamask/superstruct';

import {
  Box,
  Image,
  Radio,
  RadioGroup,
  Row,
  Spinner,
  Text,
} from '../../components';
import { RadioGroupStruct } from './radio-group';

describe('RadioGroupStruct', () => {
  it.each([
    <RadioGroup name="foo">
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
    </RadioGroup>,
  ])('validates a radio group element', (value) => {
    expect(is(value, RadioGroupStruct)).toBe(true);
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
    expect(is(value, RadioGroupStruct)).toBe(false);
  });
});
