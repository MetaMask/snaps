import { is } from '@metamask/superstruct';

import { Box, Button, Footer, Icon, Image, Row, Text } from '../components';
import { FooterStruct } from './footer';

describe('FooterStruct', () => {
  it.each([
    <Footer>
      <Button name="confirm">Confirm</Button>
    </Footer>,
    <Footer>
      <Button name="cancel">Cancel</Button>
      <Button name="confirm">Confirm</Button>
    </Footer>,
    <Footer>
      <Button name="cancel">Cancel {true && 'foo'}</Button>
    </Footer>,
  ])('validates a footer element', (value) => {
    expect(is(value, FooterStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Footer />,
    <Footer>
      <Text>foo</Text>
    </Footer>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
    <Footer>
      <Button name="confirm">
        <Icon name="warning" />
      </Button>
    </Footer>,
    <Footer>
      <Button name="cancel">
        <Image src="<svg />" />
      </Button>
      <Button name="confirm">
        <Image src="<svg />" />
      </Button>
    </Footer>,
    <Footer>
      <Button name="confirm">
        <Icon name="warning" />
        <Icon name="warning" />
      </Button>
    </Footer>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, FooterStruct)).toBe(false);
  });
});
