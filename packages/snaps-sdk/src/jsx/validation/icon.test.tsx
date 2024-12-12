import { is } from '@metamask/superstruct';

import { Box, Icon, Image, Row } from '../components';
import { IconStruct } from './icon';

describe('IconStruct', () => {
  it.each([
    <Icon name="warning" />,
    <Icon name="wifi" color="muted" />,
    <Icon name="wifi" size="md" />,
    <Icon name="warning" color="default" size="inherit" />,
  ])('validates an icon element', (value) => {
    expect(is(value, IconStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Icon />,
    // @ts-expect-error - Invalid props.
    <Icon name="bar">foo</Icon>,
    // @ts-expect-error - Invalid props.
    <Icon name="bar" color="foo" />,
    // @ts-expect-error - Invalid props.
    <Icon name="bar" size="foo" />,
    <Box>
      <Icon name="wifi" />
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, IconStruct)).toBe(false);
  });
});
