import type { FormState, InterfaceState } from '@metamask/snaps-sdk';
import {
  Box,
  Button,
  Dropdown,
  Option,
  Field,
  Form,
  Input,
  Text,
  FileInput,
} from '@metamask/snaps-sdk/jsx';

import {
  assertFormNameIsUnique,
  assertNameIsUnique,
  constructState,
} from './utils';

describe('assertNameIsUnique', () => {
  it('throws an error if a name is not unique', () => {
    const state: InterfaceState = {
      test: {
        type: 'Input',
        value: 'foo',
      },
    };

    expect(() => assertNameIsUnique(state, 'test')).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('passes if there is no duplicate name', () => {
    const state: InterfaceState = {
      test: {
        type: 'Input',
        value: 'foo',
      },
    };

    expect(() => assertNameIsUnique(state, 'bar')).not.toThrow();
  });
});

describe('assertFormNameIsUnique', () => {
  it('throws an error if a name is not unique', () => {
    const state: FormState = {
      type: 'Form',
      value: {
        test: {
          type: 'Input',
          value: 'foo',
        },
      },
    };

    expect(() => assertFormNameIsUnique(state, 'test')).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('passes if there is no duplicate name', () => {
    const state: FormState = {
      type: 'Form',
      value: {
        test: {
          type: 'Input',
          value: 'foo',
        },
      },
    };

    expect(() => assertFormNameIsUnique(state, 'bar')).not.toThrow();
  });
});

describe('constructState', () => {
  it('can construct a new component state', () => {
    const element = (
      <Box>
        <Text>text</Text>
        <Form name="foo">
          <Field label="Bar">
            <Input type="text" name="bar" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element);

    expect(result).toStrictEqual({
      foo: {
        type: 'Form',
        value: {
          bar: {
            type: 'Input',
            value: null,
          },
        },
      },
    });
  });

  it('can construct a new component state from a field with a button', () => {
    const element = (
      <Box>
        <Text>text</Text>
        <Form name="foo">
          <Field label="Bar">
            <Input type="text" name="bar" />
            <Button>Button</Button>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element);

    expect(result).toStrictEqual({
      foo: {
        type: 'Form',
        value: {
          bar: {
            type: 'Input',
            value: null,
          },
        },
      },
    });
  });

  it('merges two states', () => {
    const state: InterfaceState = {
      foo: {
        type: 'Form',
        value: {
          bar: {
            type: 'Input',
            value: 'test',
          },
        },
      },
    };

    const element = (
      <Box>
        <Text>text</Text>
        <Form name="foo">
          <Field label="Bar">
            <Input type="text" name="bar" value="test" />
          </Field>
          <Field label="Baz">
            <Input type="text" name="baz" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState(state, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Form',
        value: {
          bar: {
            type: 'Input',
            value: 'test',
          },
          baz: {
            type: 'Input',
            value: null,
          },
        },
      },
    });
  });

  it('deletes unused state', () => {
    const state: InterfaceState = {
      form: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'test',
          },
          bar: {
            type: 'Input',
            value: 'test',
          },
        },
      },
    };

    const element = (
      <Box>
        <Text>text</Text>
        <Form name="form">
          <Field label="Bar">
            <Input type="text" name="bar" value="test" />
          </Field>
          <Field label="Baz">
            <Input type="text" name="baz" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState(state, element);
    expect(result).toStrictEqual({
      form: {
        type: 'Form',
        value: {
          bar: {
            type: 'Input',
            value: 'test',
          },
          baz: {
            type: 'Input',
            value: null,
          },
        },
      },
    });
  });

  it('handles multiple forms', () => {
    const state: InterfaceState = {
      form1: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'test',
          },
          bar: {
            type: 'Input',
            value: 'test',
          },
        },
      },
      form2: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'abc',
          },
          bar: {
            type: 'Input',
            value: 'def',
          },
        },
      },
    };

    const element = (
      <Box>
        <Text>text</Text>
        <Form name="form1">
          <Field label="Bar">
            <Input type="text" name="bar" value="test" />
          </Field>
          <Field label="Baz">
            <Input type="text" name="baz" />
          </Field>
        </Form>
        <Form name="form2">
          <Field label="Bar">
            <Input type="text" name="bar" value="def" />
          </Field>
          <Field label="Baz">
            <Input type="text" name="baz" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState(state, element);

    expect(result).toStrictEqual({
      form1: {
        type: 'Form',
        value: {
          bar: { type: 'Input', value: 'test' },
          baz: { type: 'Input', value: null },
        },
      },
      form2: {
        type: 'Form',
        value: {
          bar: { type: 'Input', value: 'def' },
          baz: { type: 'Input', value: null },
        },
      },
    });
  });

  it('deletes an unused form', () => {
    const state: InterfaceState = {
      form1: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'test',
          },
          bar: {
            type: 'Input',
            value: 'test',
          },
        },
      },
      form2: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'abc',
          },
          bar: {
            type: 'Input',
            value: 'def',
          },
        },
      },
    };

    const element = (
      <Box>
        <Text>text</Text>
        <Form name="form1">
          <Field label="Bar">
            <Input type="text" name="bar" value="test" />
          </Field>
          <Field label="Baz">
            <Input type="text" name="baz" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState(state, element);
    expect(result).toStrictEqual({
      form1: {
        type: 'Form',
        value: {
          bar: { type: 'Input', value: 'test' },
          baz: { type: 'Input', value: null },
        },
      },
    });
  });

  it('handles nested forms', () => {
    const state: InterfaceState = {
      form1: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: null,
          },
          bar: {
            type: 'Input',
            value: 'test',
          },
        },
      },
      form2: {
        type: 'Form',
        value: {
          foo: {
            type: 'Input',
            value: 'abc',
          },
          bar: {
            type: 'Input',
            value: 'def',
          },
        },
      },
    };

    const element = (
      <Box>
        <Text>text</Text>
        <Box>
          <Form name="form1">
            <Field label="Bar">
              <Input type="text" name="bar" value="test" />
            </Field>
            <Field label="Baz">
              <Input type="text" name="baz" />
            </Field>
          </Form>
        </Box>
        <Box>
          <Form name="form2">
            <Field label="Bar">
              <Input type="text" name="bar" value="def" />
            </Field>
            <Field label="Baz">
              <Input type="text" name="baz" />
            </Field>
          </Form>
        </Box>
      </Box>
    );

    const result = constructState(state, element);
    expect(result).toStrictEqual({
      form1: {
        type: 'Form',
        value: {
          bar: { type: 'Input', value: 'test' },
          baz: { type: 'Input', value: null },
        },
      },
      form2: {
        type: 'Form',
        value: {
          bar: { type: 'Input', value: 'def' },
          baz: { type: 'Input', value: null },
        },
      },
    });
  });

  it('handles root level inputs with value', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" value="bar" />
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Input',
        value: 'bar',
      },
    });
  });

  it('handles root level inputs without value', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Input',
        value: null,
      },
    });
  });

  it('sets default value for root level dropdown', () => {
    const element = (
      <Box>
        <Dropdown name="foo">
          <Option value="option1">Option 1</Option>
          <Option value="option2">Option 2</Option>
        </Dropdown>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Dropdown',
        value: 'option1',
      },
    });
  });

  it('supports root level dropdowns', () => {
    const element = (
      <Box>
        <Dropdown name="foo" value="option2">
          <Option value="option1">Option 1</Option>
          <Option value="option2">Option 2</Option>
        </Dropdown>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Dropdown',
        value: 'option2',
      },
    });
  });

  it('sets default value for dropdowns in forms', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Dropdown name="foo">
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
            </Dropdown>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      form: {
        type: 'Form',
        value: {
          foo: {
            type: 'Dropdown',
            value: 'option1',
          },
        },
      },
    });
  });

  it('supports dropdowns in forms', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Dropdown name="foo" value="option2">
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
            </Dropdown>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      form: {
        type: 'Form',
        value: {
          foo: {
            type: 'Dropdown',
            value: 'option2',
          },
        },
      },
    });
  });

  it('supports nested fields', () => {
    const element = (
      <Box>
        <Form name="form">
          <Text>Foo</Text>
          <Box>
            <Field label="bar">
              <Dropdown name="bar" value="option2">
                <Option value="option1">Option 1</Option>
                <Option value="option2">Option 2</Option>
              </Dropdown>
            </Field>
          </Box>
        </Form>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      form: {
        type: 'Form',
        value: {
          bar: {
            type: 'Dropdown',
            value: 'option2',
          },
        },
      },
    });
  });

  it('supports nested forms by tying fields to nearest form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Text>Foo</Text>
          <Box>
            <Form name="form2">
              <Field label="bar">
                <Dropdown name="bar" value="option2">
                  <Option value="option1">Option 1</Option>
                  <Option value="option2">Option 2</Option>
                </Dropdown>
              </Field>
            </Form>
            <Field label="baz">
              <Dropdown name="baz" value="option4">
                <Option value="option3">Option 3</Option>
                <Option value="option4">Option 4</Option>
              </Dropdown>
            </Field>
          </Box>
        </Form>
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      form: {
        type: 'Form',
        value: {
          baz: {
            type: 'Dropdown',
            value: 'option4',
          },
        },
      },
      form2: {
        type: 'Form',
        value: {
          bar: { type: 'Dropdown', value: 'option2' },
        },
      },
    });
  });

  it('deletes unused root level values', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const oldState: InterfaceState = {
      foo: {
        type: 'Input',
        value: null,
      },
      bar: {
        type: 'Input',
        value: null,
      },
    };

    const result = constructState(oldState, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Input',
        value: null,
      },
    });
  });

  it('merges root level inputs from old state', () => {
    const state: InterfaceState = {
      foo: {
        type: 'Input',
        value: 'bar',
      },
    };

    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const result = constructState(state, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'Input',
        value: 'bar',
      },
    });
  });

  it('supports file inputs', () => {
    const element = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );

    const result = constructState({}, element);
    expect(result).toStrictEqual({
      foo: {
        type: 'FileInput',
        value: null,
      },
    });
  });

  it('throws if a name is not unique in a form', () => {
    const element = (
      <Form name="test">
        <Field label="Foo">
          <Input name="foo" type="text" />
        </Field>
        <Field label="Bar">
          <Input name="foo" type="text" />
        </Field>
      </Form>
    );

    expect(() => constructState({}, element)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "foo".`,
    );
  });

  it('throws if a name is not unique at the root', () => {
    const element = (
      <Box>
        <Input name="test" type="text" />
        <Input name="test" type="text" />
      </Box>
    );

    expect(() => constructState({}, element)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('throws if a form has the same name as an input', () => {
    const element = (
      <Box>
        <Input name="test" type="text" />
        <Form name="test">
          <Field label="Foo">
            <Input name="foo" type="text" />
          </Field>
        </Form>
      </Box>
    );

    expect(() => constructState({}, element)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });
});
