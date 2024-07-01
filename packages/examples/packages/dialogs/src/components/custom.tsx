import {
  Box,
  Button,
  Container,
  Footer,
  Heading,
  Input,
  Text,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

/**
 * A custom dialog component.
 *
 * @returns The custom dialog component.
 */
export const CustomDialog: SnapComponent = () => (
  <Container>
    <Box>
      <Heading>Custom Dialog</Heading>
      <Text>
        This is a custom dialog. It has a custom Footer and can be resolved to
        any value.
      </Text>
      <Input name="custom-input" placeholder="Enter something..." />
    </Box>
    <Footer>
      <Button name="cancel">Cancel</Button>
      <Button name="confirm">Confirm</Button>
    </Footer>
  </Container>
);
