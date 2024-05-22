import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Button,
  Box,
  Field,
  Heading,
  Form,
  Input,
} from '@metamask/snaps-sdk/jsx';

export const InteractiveForm: SnapComponent = () => {
  return (
    <Box>
      <Heading>Interactive UI Example Snap</Heading>
      <Form name="example-form">
        <Field label="Example Input">
          <Input name="example-input" placeholder="Enter something..." />
        </Field>
        <Button type="submit" name="submit">
          Submit
        </Button>
      </Form>
    </Box>
  );
};
