import {
  Box,
  Button,
  Container,
  Footer,
  Text,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

/**
 * Long content that requires scrolling.
 *
 * @returns The long content component.
 */
export const RequireScrollContent: SnapComponent = () => (
  <Container>
    <Box direction="vertical">
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
      <Text>lorem ipsum dolor sit amet</Text>
    </Box>
    <Footer requireScroll>
      <Button name="reject">Reject</Button>
      <Button name="accept">Yes</Button>
    </Footer>
  </Container>
);
