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
    <Box>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
      <Text>Lorem ipsum dolor sit amet.</Text>
    </Box>
    <Footer>
      <Button name="reject">Reject</Button>
      <Button name="accept">Yes</Button>
    </Footer>
  </Container>
);
