import { AddressInput } from './AddressInput';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { Field } from './Field';
import { Input } from './Input';
import { Option } from './Option';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { Box } from '../Box';
import { Text } from '../Text';

describe('Field', () => {
  it('renders a field element', () => {
    const result = (
      <Field label="Label">
        <Input name="foo" type="text" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'Input',
          key: null,
          props: {
            name: 'foo',
            type: 'text',
          },
        },
      },
    });
  });

  it('renders a field element with an error', () => {
    const result = (
      <Field label="Label" error="Error">
        <Input name="foo" type="text" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        error: 'Error',
        children: {
          type: 'Input',
          key: null,
          props: {
            name: 'foo',
            type: 'text',
          },
        },
      },
    });
  });

  it('renders a field element with an input and a button', () => {
    const result = (
      <Field label="Label">
        <Input name="foo" type="text" />
        <Button type="submit">Submit</Button>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: [
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
              type: 'text',
            },
          },
          {
            type: 'Button',
            key: null,
            props: {
              type: 'submit',
              children: 'Submit',
            },
          },
        ],
      },
    });
  });

  it('renders a field element with an input and box on the left', () => {
    const result = (
      <Field label="Label">
        <Box>
          <Text>Hello</Text>
        </Box>
        <Input name="foo" type="text" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: [
          {
            type: 'Box',
            key: null,
            props: {
              children: {
                type: 'Text',
                key: null,
                props: {
                  children: 'Hello',
                },
              },
            },
          },
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
              type: 'text',
            },
          },
        ],
      },
    });
  });

  it('renders a field element with an input and box on the right', () => {
    const result = (
      <Field label="Label">
        <Input name="foo" type="text" />
        <Box>
          <Text>Hello</Text>
        </Box>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: [
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
              type: 'text',
            },
          },
          {
            type: 'Box',
            key: null,
            props: {
              children: {
                type: 'Text',
                key: null,
                props: {
                  children: 'Hello',
                },
              },
            },
          },
        ],
      },
    });
  });

  it('renders a field element with an input and box on both sides', () => {
    const result = (
      <Field label="Label">
        <Box>
          <Text>Hello</Text>
        </Box>
        <Input name="foo" type="text" />
        <Box>
          <Text>Hello</Text>
        </Box>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: [
          {
            type: 'Box',
            key: null,
            props: {
              children: {
                type: 'Text',
                key: null,
                props: {
                  children: 'Hello',
                },
              },
            },
          },
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
              type: 'text',
            },
          },
          {
            type: 'Box',
            key: null,
            props: {
              children: {
                type: 'Text',
                key: null,
                props: {
                  children: 'Hello',
                },
              },
            },
          },
        ],
      },
    });
  });

  it('renders a dropdown element', () => {
    const result = (
      <Field label="Label">
        <Dropdown name="foo">
          <Option value="option1">Option 1</Option>
          <Option value="option2">Option 2</Option>
        </Dropdown>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'Dropdown',
          key: null,
          props: {
            name: 'foo',
            children: [
              {
                type: 'Option',
                key: null,
                props: {
                  children: 'Option 1',
                  value: 'option1',
                },
              },
              {
                type: 'Option',
                key: null,
                props: {
                  children: 'Option 2',
                  value: 'option2',
                },
              },
            ],
          },
        },
      },
    });
  });

  it('renders a radio group element', () => {
    const result = (
      <Field label="Label">
        <RadioGroup name="foo">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'RadioGroup',
          key: null,
          props: {
            name: 'foo',
            children: [
              {
                type: 'Radio',
                key: null,
                props: {
                  children: 'Option 1',
                  value: 'option1',
                },
              },
              {
                type: 'Radio',
                key: null,
                props: {
                  children: 'Option 2',
                  value: 'option2',
                },
              },
            ],
          },
        },
      },
    });
  });

  it('renders a field element with an address input', () => {
    const result = (
      <Field label="Label">
        <AddressInput name="address" chainId="eip155:1" />
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        label: 'Label',
        children: {
          type: 'AddressInput',
          key: null,
          props: {
            name: 'address',
            chainId: 'eip155:1',
          },
        },
      },
    });
  });

  it('renders a field with a conditional', () => {
    const result = (
      <Field>
        <Input name="foo" />
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && <Button type="submit">Submit</Button>}
      </Field>
    );

    expect(result).toStrictEqual({
      type: 'Field',
      key: null,
      props: {
        children: [
          {
            type: 'Input',
            key: null,
            props: {
              name: 'foo',
            },
          },
          false,
        ],
      },
    });
  });
});
