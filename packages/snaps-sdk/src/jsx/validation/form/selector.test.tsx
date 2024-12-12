import { is } from '@metamask/superstruct';

import {
  Box,
  Card,
  Image,
  Row,
  Selector,
  SelectorOption,
  Text,
} from '../../components';
import { SelectorStruct } from './selector';

describe('SelectorStruct', () => {
  it.each([
    <Selector name="foo" title="Title">
      <SelectorOption value="option1">
        <Card title="Foo" value="$1" />
      </SelectorOption>
      <SelectorOption value="option2">
        <Card title="bar" value="$1" />
      </SelectorOption>
    </Selector>,
  ])('validates a selector element', (value) => {
    expect(is(value, SelectorStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Selector>foo</Selector>,
    // @ts-expect-error - Invalid props.
    <Selector>
      <SelectorOption value="foo">
        <Card title="Foo" value="$1" />
      </SelectorOption>
    </Selector>,
    // @ts-expect-error - Invalid props.
    <Selector title="Choose an option">
      <SelectorOption value="foo">
        <Card title="Foo" value="$1" />
      </SelectorOption>
    </Selector>,
    // @ts-expect-error - Invalid props.
    <Selector name="foo">
      <SelectorOption value="foo">
        <Card title="Foo" value="$1" />
      </SelectorOption>
    </Selector>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, SelectorStruct)).toBe(false);
  });
});
