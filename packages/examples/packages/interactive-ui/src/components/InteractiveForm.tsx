import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Button,
  Box,
  Field,
  Heading,
  Form,
  Input,
  Dropdown,
  Option,
  Checkbox,
} from '@metamask/snaps-sdk/jsx';

/**
 * The state of the {@link InteractiveForm} component.
 */
export type InteractiveFormState = {
  /**
   * The value of the example input.
   */
  'example-input': string;

  /**
   * The value of the example dropdown.
   */
  'example-dropdown': string;

  /**
   * The value of the example checkbox.
   */
  'example-checkbox': boolean;
};

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
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
            <Option value="option3">Option 3</Option>
          </Dropdown>
        </Field>
        <Field label="Example Checkbox">
          <Checkbox name="example-checkbox" label="Checkbox" />
        </Field>
        <Button type="submit" name="submit">
          Submit
        </Button>
      </Form>
    </Box>
  );
};
