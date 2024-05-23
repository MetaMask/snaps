import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Button,
  Box,
  Field,
  Heading,
  Form,
  Input,
  Dropdown,
  DropdownOption,
} from '@metamask/snaps-sdk/jsx';

export const InteractiveForm: SnapComponent = () => {
  return (
    <Box>
      <Heading>Interactive UI Example Snap</Heading>
      <Form name="example-form">
        <Field label="Example Input">
          <Input name="example-input" placeholder="Enter something..." />
        </Field>
        <Field label="Example Dropdown">
          <Dropdown name="example-dropdown">
            <DropdownOption value="option1">Option 1</DropdownOption>
            <DropdownOption value="option2">Option 2</DropdownOption>
            <DropdownOption value="option3">Option 3</DropdownOption>
          </Dropdown>
        </Field>
        <Button type="submit" name="submit">
          Submit
        </Button>
      </Form>
    </Box>
  );
};
