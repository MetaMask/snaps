import { panel, text } from '@metamask/snaps-sdk';
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
  Checkbox,
  RadioGroup,
  Radio,
  Selector,
  Card,
  SelectorOption,
  AssetSelector,
} from '@metamask/snaps-sdk/jsx';

import {
  assertNameIsUnique,
  constructState,
  getAssetSelectorStateValue,
  getJsxInterface,
} from './utils';

describe('getJsxInterface', () => {
  it('returns the JSX interface for a JSX element', () => {
    expect(
      getJsxInterface(
        <Box>
          <Text>Hello</Text>
        </Box>,
      ),
    ).toStrictEqual(
      Box({
        children: Text({
          children: 'Hello',
        }),
      }),
    );
  });

  it('returns the JSX interface for a legacy element', () => {
    expect(getJsxInterface(panel([text('Hello')]))).toStrictEqual(
      Box({
        children: Text({
          children: 'Hello',
        }),
      }),
    );
  });
});

describe('assertNameIsUnique', () => {
  it('throws an error if a name is not unique', () => {
    const state = { test: 'foo' };

    expect(() => assertNameIsUnique(state, 'test')).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('passes if there is no duplicate name', () => {
    const state = { test: 'foo' };

    expect(() => assertNameIsUnique(state, 'bar')).not.toThrow();
  });
});

describe('constructState', () => {
  const elementDataGetters = {
    getAssetMetadata: jest.fn(),
  };

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

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({ foo: { bar: null } });
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

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({ foo: { bar: null } });
  });

  it('merges two states', () => {
    const state = { foo: { bar: 'test' } };

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

    const result = constructState(state, element, elementDataGetters);
    expect(result).toStrictEqual({ foo: { bar: 'test', baz: null } });
  });

  it('deletes unused state', () => {
    const state = { form: { foo: null, bar: 'test' } };

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

    const result = constructState(state, element, elementDataGetters);
    expect(result).toStrictEqual({ form: { bar: 'test', baz: null } });
  });

  it('handles multiple forms', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
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

    const result = constructState(state, element, elementDataGetters);

    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
      form2: { bar: 'def', baz: null },
    });
  });

  it('deletes an unused form', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
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

    const result = constructState(state, element, elementDataGetters);
    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
    });
  });

  it('handles nested forms', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
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

    const result = constructState(state, element, elementDataGetters);
    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
      form2: { bar: 'def', baz: null },
    });
  });

  it('handles root level Field', () => {
    const element = (
      <Box>
        <Field label="foo">
          <Input name="foo" type="text" value="bar" />
        </Field>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

  it('handles root level inputs with value', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" value="bar" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

  it('handles root level inputs without value', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: null,
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option1',
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option2',
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option1' },
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option2' },
    });
  });

  it('sets default value for root level RadioGroup', () => {
    const element = (
      <Box>
        <RadioGroup name="foo">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option1',
    });
  });

  it('supports root level Radio Group', () => {
    const element = (
      <Box>
        <RadioGroup name="foo" value="option2">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option2',
    });
  });

  it('sets default value for Radio Group in form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <RadioGroup name="foo">
              <Radio value="option1">Option 1</Radio>
              <Radio value="option2">Option 2</Radio>
            </RadioGroup>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option1' },
    });
  });

  it('supports Radio Group in form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <RadioGroup name="foo" value="option2">
              <Radio value="option1">Option 1</Radio>
              <Radio value="option2">Option 2</Radio>
            </RadioGroup>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option2' },
    });
  });

  it('supports root level checkboxes in forms', () => {
    const element = (
      <Box>
        <Checkbox name="foo" checked={true} />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: true,
    });
  });

  it('sets default value for checkbox in forms', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Checkbox name="foo" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: false },
    });
  });

  it('supports checkboxes in forms', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Checkbox name="foo" checked={true} />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: true },
    });
  });

  it('sets default value for root level Selector', () => {
    const element = (
      <Box>
        <Selector name="foo" title="Choose an option">
          <SelectorOption value="option1">
            <Card title="Option 1" value="$1" />
          </SelectorOption>
          <SelectorOption value="option2">
            <Card title="Option 1" value="$1" />
          </SelectorOption>
        </Selector>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option1',
    });
  });

  it('supports root level Selector', () => {
    const element = (
      <Box>
        <Selector name="foo" title="Choose an option" value="option2">
          <SelectorOption value="option1">
            <Card title="Option 1" value="$1" />
          </SelectorOption>
          <SelectorOption value="option2">
            <Card title="Option 1" value="$1" />
          </SelectorOption>
        </Selector>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'option2',
    });
  });

  it('sets default value for Selector in form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Selector name="foo" title="Choose an option">
              <SelectorOption value="option1">
                <Card title="Option 1" value="$1" />
              </SelectorOption>
              <SelectorOption value="option2">
                <Card title="Option 1" value="$1" />
              </SelectorOption>
            </Selector>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option1' },
    });
  });

  it('supports Selector in form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <Selector name="foo" title="Choose an option" value="option2">
              <SelectorOption value="option1">
                <Card title="Option 1" value="$1" />
              </SelectorOption>
              <SelectorOption value="option2">
                <Card title="Option 1" value="$1" />
              </SelectorOption>
            </Selector>
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: 'option2' },
    });
  });

  it('sets default value for root level AssetSelector', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue({
      name: 'foobar',
      symbol: 'FOO',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('supports root level AssetSelector', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue({
      name: 'foobar',
      symbol: 'FOO',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
          value="eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: {
        asset: 'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
        name: 'foobar',
        symbol: 'FOO',
      },
    });
  });

  it('sets default value for AssetSelector in form', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AssetSelector
              name="foo"
              addresses={[
                'eip155:0:0x1234567890123456789012345678901234567890',
              ]}
            />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      form: { foo: null },
    });
  });

  it('supports AssetSelector in form', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue({
      name: 'foobar',
      symbol: 'FOO',
    });

    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AssetSelector
              name="foo"
              addresses={[
                'eip155:0:0x1234567890123456789012345678901234567890',
              ]}
              value="eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f"
            />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      form: {
        foo: {
          asset: 'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
          name: 'foobar',
          symbol: 'FOO',
        },
      },
    });
  });

  it('sets the value to null if the asset metadata is not found', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue(undefined);

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
          value="eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: null,
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { bar: 'option2' },
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

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { baz: 'option4' },
      form2: { bar: 'option2' },
    });
  });

  it('deletes unused root level values', () => {
    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const result = constructState(
      { foo: null, bar: null },
      element,
      elementDataGetters,
    );
    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('merges root level inputs from old state', () => {
    const state = {
      foo: 'bar',
    };

    const element = (
      <Box>
        <Input name="foo" type="text" />
      </Box>
    );

    const result = constructState(state, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

  it('supports file inputs', () => {
    const element = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: null,
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

    expect(() => constructState({}, element, elementDataGetters)).toThrow(
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

    expect(() => constructState({}, element, elementDataGetters)).toThrow(
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

    expect(() => constructState({}, element, elementDataGetters)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });
});

describe('getAssetSelectorStateValue', () => {
  const getAssetMetadata = jest.fn();

  it('returns the asset selector state value', () => {
    getAssetMetadata.mockReturnValue({
      name: 'foobar',
      symbol: 'FOO',
    });

    expect(
      getAssetSelectorStateValue(
        'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
        getAssetMetadata,
      ),
    ).toStrictEqual({
      asset: 'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
      name: 'foobar',
      symbol: 'FOO',
    });
  });

  it('returns null if the value is not set', () => {
    expect(getAssetSelectorStateValue(undefined, getAssetMetadata)).toBeNull();
  });

  it('returns null if the asset metadata is not found', () => {
    getAssetMetadata.mockReturnValue(undefined);

    expect(
      getAssetSelectorStateValue(
        'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
        getAssetMetadata,
      ),
    ).toBeNull();
  });
});
