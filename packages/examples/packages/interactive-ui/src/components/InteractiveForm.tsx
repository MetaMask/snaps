import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Card,
  Selector,
  SelectorOption,
  Radio,
  RadioGroup,
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
   * The value of the example RadioGroup.
   */
  'example-radiogroup': string;

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
        <Field label="Example RadioGroup">
          <RadioGroup name="example-radiogroup">
            <Radio value="option1">Option 1</Radio>
            <Radio value="option2">Option 2</Radio>
            <Radio value="option3">Option 3</Radio>
          </RadioGroup>
        </Field>
        <Field label="Example Checkbox">
          <Checkbox name="example-checkbox" label="Checkbox" />
        </Field>
        <Field label="Example Selector">
          <Selector
            name="example-selector"
            title="Choose an option"
            value="option1"
          >
            <SelectorOption value="option1">
              <Card title="Option 1" value="option1" />
            </SelectorOption>
            <SelectorOption value="option2">
              <Card title="Option 2" value="option2" />
            </SelectorOption>
            <SelectorOption value="option3">
              <Card title="Option 3" value="option3" />
            </SelectorOption>
          </Selector>
        </Field>
        <Box center>
          <Button type="submit" name="submit">
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
};
