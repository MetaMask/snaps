import { is } from '@metamask/superstruct';

import { Box, Button, Icon, Image, Row, Text } from '../../components';
import { ButtonStruct } from './button';

describe('ButtonStruct', () => {
  it.each([
    <Button>foo</Button>,
    <Button name="foo">bar</Button>,
    <Button type="submit">foo</Button>,
    <Button variant="destructive">foo</Button>,
    <Button disabled={true}>foo</Button>,
    <Button variant="primary" loading={true}>
      foo
    </Button>,
    <Button key="button">foo</Button>,
    <Button>
      <Icon name="wifi" />
    </Button>,
    <Button>
      <Image src="<svg></svg>" />
    </Button>,
    <Button form="foo">bar</Button>,
  ])('validates a button element', (value) => {
    expect(is(value, ButtonStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Button />,
    // @ts-expect-error - Invalid props.
    <Button variant="foo">bar</Button>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ButtonStruct)).toBe(false);
  });
});
