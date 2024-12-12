import { is } from '@metamask/superstruct';

import {
  Box,
  Button,
  Container,
  Footer,
  Image,
  Row,
  Text,
} from '../components';
import { ContainerStruct } from './container';

describe('ContainerStruct', () => {
  it.each([
    <Container>
      <Box>
        <Text>Hello world!</Text>
      </Box>
    </Container>,
    <Container>
      <Box>
        <Text>Hello world!</Text>
      </Box>
      <Footer>
        <Button name="confirm">Confirm</Button>
      </Footer>
    </Container>,
    <Container>
      <Text>Hello world!</Text>
    </Container>,
    <Container>
      <Text>Hello world!</Text>
      <Footer>
        <Button name="confirm">Confirm</Button>
      </Footer>
    </Container>,
  ])('validates a container element', (value) => {
    expect(is(value, ContainerStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    // @ts-expect-error - Invalid props.
    <Container />,
    <Container>
      <Box>
        <Text>Hello world!</Text>
      </Box>
      <Footer>
        <Text>foo</Text>
      </Footer>
    </Container>,
    <Text>foo</Text>,
    <Box>
      <Text>foo</Text>
    </Box>,
    <Row label="label">
      <Image src="<svg />" alt="alt" />
    </Row>,
  ])('does not validate "%p"', (value) => {
    expect(is(value, ContainerStruct)).toBe(false);
  });
});
