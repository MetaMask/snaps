import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Field,
  Form,
  Box,
  Container,
  Heading,
  Text,
  Input,
  Footer,
  Button,
} from '@metamask/snaps-sdk/jsx';

/**
 * A custom dialog component.
 *
 * @returns The custom dialog component.
 */
export const Dialog: SnapComponent = () => (
  <Container>
    <Box>
      <Heading>Custom Dialog</Heading>
      <Text>
        This is a custom dialog. It has a custom footer and can be resolved to
        any value.
      </Text>
      <Form name="form">
        <Field label="Field">
          <Input name="custom-input" placeholder="Enter something..." />
        </Field>
      </Form>
    </Box>
    <Footer>
      <Button name="cancel">Cancel</Button>
      <Button name="confirm" type="submit" form="form">
        Confirm
      </Button>
    </Footer>
  </Container>
);
