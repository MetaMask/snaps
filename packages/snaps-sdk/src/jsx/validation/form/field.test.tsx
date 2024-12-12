import { is } from '@metamask/superstruct';

import {
  Box,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Field,
  Image,
  Input,
  Option,
  Radio,
  RadioGroup,
  Row,
  Selector,
  SelectorOption,
  Text,
} from '../../components';
import { FieldStruct } from './field';

describe('FieldStruct', () => {
  it.each([
    <Field label="foo">
      <Input name="foo" type="text" />
    </Field>,
    <Field label="foo">
      <Box>
        <Text>Hello</Text>
      </Box>
      <Input name="foo" type="text" />
    </Field>,
    <Field label="foo">
      <Input name="foo" type="text" />
      <Box>
        <Text>Hello</Text>
      </Box>
    </Field>,
    <Field label="foo">
      <Box>
        <Text>Hello</Text>
      </Box>
      <Input name="foo" type="text" />
      <Box>
        <Text>Hello</Text>
      </Box>
    </Field>,
    <Field label="foo">
      <Text>Hello</Text>
      <Input name="foo" type="text" />
      <Text>Hello</Text>
    </Field>,
    <Field label="foo">
      <Input name="foo" type="text" />
      <Button>foo</Button>
    </Field>,
    <Field error="bar">
      <Input name="foo" type="text" />
    </Field>,
    <Field label="foo">
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    </Field>,
    <Field label="foo">
      <RadioGroup name="foo">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    </Field>,
    <Field label="foo">
      <Checkbox name="foo" />
    </Field>,
    <Field label="foo">
      <Selector name="foo" title="Choose an option">
        <SelectorOption value="option1">
          <Card title="Foo" value="$1" />
        </SelectorOption>
        <SelectorOption value="option2">
          <Card title="bar" value="$1" />
        </SelectorOption>
      </Selector>
    </Field>,
  ])('validates a field element', (value) => {
    expect(is(value, FieldStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Field />,
    <Field label="foo" error="bar">
      <Text>foo</Text>
    </Field>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FieldStruct)).toBe(false);
  });
});
