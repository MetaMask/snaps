import { is } from '@metamask/superstruct';

import {
  Box,
  Dropdown,
  Image,
  Option,
  Row,
  Spinner,
  Text,
} from '../../components';
import { DropdownStruct } from './dropdown';

describe('DropdownStruct', () => {
  it.each([
    <Dropdown name="foo">
      <Option value="option1">Option 1</Option>
      <Option value="option2">Option 2</Option>
    </Dropdown>,
  ])('validates a dropdown element', (value) => {
    expect(is(value, DropdownStruct)).toBe(true);
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
    expect(is(value, DropdownStruct)).toBe(false);
  });
});
