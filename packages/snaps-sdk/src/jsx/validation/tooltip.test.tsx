import { is } from '@metamask/superstruct';

import { Bold, Box, Copyable, Image, Row, Text, Tooltip } from '../components';
import { TooltipStruct } from './tooltip';

describe('TooltipStruct', () => {
  it.each([
    <Tooltip content="foo">
      <Text>bar</Text>
    </Tooltip>,
    <Tooltip content={<Text>foo</Text>}>
      <Bold>bar</Bold>
    </Tooltip>,
  ])(`validates a tooltip element`, (value) => {
    expect(is(value, TooltipStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Tooltip />,
    // @ts-expect-error - Invalid props.
    <Tooltip foo="bar">foo</Tooltip>,
    <Tooltip content={<Copyable value="bar" />}>
      <Text>foo</Text>
    </Tooltip>,
    <Box>
      <Tooltip content={'foo'}>
        <Text>foo</Text>
      </Tooltip>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, TooltipStruct)).toBe(false);
  });
});
