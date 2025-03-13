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
  getAssetSelectorDefaultState,
  getAssetSelectorStateValue,
  getDefaultAsset,
  getJsxInterface,
  validateAssetSelector,
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
    getAssetsState: jest.fn(),
    getAccountByAddress: jest.fn(),
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
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105'],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: 'foo',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: {
        asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        name: 'Solana',
        symbol: 'SOL',
      },
    });
  });

  it('supports root level AssetSelector', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue({
      name: 'Solana',
      symbol: 'SOL',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
          value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: {
        asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        name: 'Solana',
        symbol: 'SOL',
      },
    });
  });

  it('sets default value for AssetSelector in form', () => {
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105'],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: 'foo',
    });

    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AssetSelector
              name="foo"
              addresses={[
                'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
              ]}
            />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      form: {
        foo: {
          asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
          name: 'Solana',
          symbol: 'SOL',
        },
      },
    });
  });

  it('supports AssetSelector in form', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue({
      name: 'Solana',
      symbol: 'SOL',
    });

    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AssetSelector
              name="foo"
              addresses={[
                'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
              ]}
              value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105"
            />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      form: {
        foo: {
          asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
          name: 'Solana',
          symbol: 'SOL',
        },
      },
    });
  });

  it('sets the value to null if the asset metadata is not found', () => {
    elementDataGetters.getAssetMetadata.mockReturnValue(undefined);
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: [],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: 'foo',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
          value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('sets the value to null if the account has no assets', () => {
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: [],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: 'foo',
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
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
      name: 'Solana',
      symbol: 'SOL',
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetMetadata,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('returns null if the value is not set', () => {
    expect(getAssetSelectorStateValue(undefined, getAssetMetadata)).toBeNull();
  });

  it('returns null if the asset metadata is not found', () => {
    getAssetMetadata.mockReturnValue(undefined);

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetMetadata,
      ),
    ).toBeNull();
  });
});

describe('getAssetSelectorDefaultState', () => {
  it('returns the default asset for an asset selector', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501'],
      },
    });

    const getAssetMetadata = jest.fn();

    expect(
      getAssetSelectorDefaultState(
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        { getAccountByAddress, getAssetsState, getAssetMetadata },
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('returns null if the default asset is not found', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: [],
      },
    });

    const getAssetMetadata = jest.fn();

    expect(
      getAssetSelectorDefaultState(
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        { getAccountByAddress, getAssetsState, getAssetMetadata },
      ),
    ).toBeNull();
  });
});

describe('validateAssetSelector', () => {
  it('passes if the address is available in the client', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    expect(
      validateAssetSelector(
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        getAccountByAddress,
      ),
    ).toBeUndefined();
  });

  it('throws if the address is not available in the client', () => {
    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    expect(() =>
      validateAssetSelector(
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
        />,
        getAccountByAddress,
      ),
    ).toThrow(
      `Could not find account for address: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv`,
    );
  });
});

describe('getDefaultAsset', () => {
  it('returns the native asset if available', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501'],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetMetadata = jest.fn();

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        { getAssetsState, getAccountByAddress, getAssetMetadata },
      ),
    ).toStrictEqual({
      address: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('returns the first asset if no native asset is available', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            name: 'USDC',
            symbol: 'USDC',
          },
      },
      accountsAssets: {
        foo: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetMetadata = jest.fn();

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        { getAssetsState, getAccountByAddress, getAssetMetadata },
      ),
    ).toStrictEqual({
      address:
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USDC',
      symbol: 'USDC',
    });
  });

  it('returns undefined if no assets are available', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {},
      accountsAssets: {
        foo: [],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetMetadata = jest.fn();

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        { getAssetsState, getAccountByAddress, getAssetMetadata },
      ),
    ).toBeUndefined();
  });

  it('selects the default asset from the requested network', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
          symbol: 'SOL',
        },
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1/slip44:501': {
          name: 'Solana Devnet',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        foo: [
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1/slip44:501',
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        ],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: 'foo',
    });

    const getAssetMetadata = jest.fn();

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        { getAssetsState, getAccountByAddress, getAssetMetadata },
      ),
    ).toStrictEqual({
      address: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('returns undefined if the account is not found', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {},
      accountsAssets: {
        foo: [],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    const getAssetMetadata = jest.fn();

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        { getAssetsState, getAccountByAddress, getAssetMetadata },
      ),
    ).toBeUndefined();
  });
});
