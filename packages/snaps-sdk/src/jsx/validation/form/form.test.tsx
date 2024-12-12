import { is } from '@metamask/superstruct';

import {
  Box,
  Button,
  Field,
  Form,
  Image,
  Input,
  Row,
  Text,
} from '../../components';
import { FormStruct } from './form';

describe('FormStruct', () => {
  it.each([
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
        <Button>foo</Button>
      </Field>
    </Form>,
    <Form name="foo">
      <Field label="foo">
        <Input name="foo" type="text" />
      </Field>
    </Form>,
    <Form name="foo">
      <Field error="foo">
        <Input name="foo" type="text" />
        <Button>foo</Button>
      </Field>
    </Form>,
    <Form name="foo">
      <Field error="foo">
        <Input name="foo" type="text" />
      </Field>
    </Form>,
  ])('validates a form element', (value) => {
    expect(is(value, FormStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Form />,
    <Form name="foo">
      <Field label="foo">
        <Text>foo</Text>
      </Field>
    </Form>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FormStruct)).toBe(false);
  });
});
