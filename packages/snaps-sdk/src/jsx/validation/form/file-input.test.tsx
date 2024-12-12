import { is } from '@metamask/superstruct';

import { Box, FileInput, Image, Row, Text } from '../../components';
import { FileInputStruct } from './file-input';

describe('FileInputStruct', () => {
  it.each([
    <FileInput name="foo" />,
    <FileInput name="foo" accept={['image/*']} />,
    <FileInput name="foo" compact />,
  ])('validates a file input element', (value) => {
    expect(is(value, FileInputStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <FileInput />,
    // @ts-expect-error - Invalid props.
    <FileInput name={42} />,
    // @ts-expect-error - Invalid props.
    <FileInput name="foo" accept="image/*" />,
    // @ts-expect-error - Invalid props.
    <FileInput name="foo" compact="true" />,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="src" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FileInputStruct)).toBe(false);
  });
});
