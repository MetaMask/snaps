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
  AddressInput,
  AccountSelector,
} from '@metamask/snaps-sdk/jsx';
import type { CaipAccountId } from '@metamask/utils';
import { parseCaipAccountId } from '@metamask/utils';

import {
  assertNameIsUnique,
  constructState,
  formatAccountSelectorStateValue,
  getAccountSelectorDefaultStateValue,
  getAccountSelectorStateValue,
  getAssetSelectorStateValue,
  getDefaultAsset,
  getJsxInterface,
  isStatefulComponent,
  matchingChainId,
} from './utils';
import { MOCK_ACCOUNT_ID } from '../test-utils';

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
    getAssetsState: jest.fn(),
    getAccountByAddress: jest.fn(),
    getSelectedAccount: jest.fn(),

    listAccounts: jest.fn(),
    snapOwnsAccount: jest.fn(),
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

  it('handles root level AddressInput with value', () => {
    const element = (
      <Box>
        <AddressInput name="foo" chainId="eip155:1" value="0x123" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: 'eip155:1:0x123',
    });
  });

  it('handles root level AddressInput without value', () => {
    const element = (
      <Box>
        <AddressInput name="foo" chainId="eip155:1" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('handles AddressInput in forms', () => {
    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AddressInput name="foo" chainId="eip155:1" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: { foo: null },
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

  it('sets default value for root level AccountSelector', () => {
    elementDataGetters.getSelectedAccount.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });

    elementDataGetters.getAccountByAddress.mockImplementation(
      (caipAccountId: CaipAccountId) => {
        const { address } = parseCaipAccountId(caipAccountId);
        return {
          id: MOCK_ACCOUNT_ID,
          address,
          scopes: ['eip155:0'],
        };
      },
    );

    const element = (
      <Box>
        <AccountSelector name="foo" />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: {
        accountId: MOCK_ACCOUNT_ID,
        addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
      },
    });
  });

  it('supports root level AccountSelector', () => {
    elementDataGetters.getSelectedAccount.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });

    elementDataGetters.getAccountByAddress.mockImplementation(
      (caipAccountId: CaipAccountId) => {
        const { address } = parseCaipAccountId(caipAccountId);
        return {
          id: MOCK_ACCOUNT_ID,
          address,
          scopes: ['eip155:0'],
        };
      },
    );

    const element = (
      <Box>
        <AccountSelector
          name="foo"
          value="eip155:0:0x1234567890123456789012345678901234567890"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      foo: {
        accountId: MOCK_ACCOUNT_ID,
        addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
      },
    });
  });

  it('sets default value for AccountSelector in form', () => {
    elementDataGetters.getSelectedAccount.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });

    elementDataGetters.getAccountByAddress.mockImplementation(
      (caipAccountId: CaipAccountId) => {
        const { address } = parseCaipAccountId(caipAccountId);
        return {
          id: MOCK_ACCOUNT_ID,
          address,
          scopes: ['eip155:0'],
        };
      },
    );

    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AccountSelector name="foo" />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: {
        foo: {
          accountId: MOCK_ACCOUNT_ID,
          addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
        },
      },
    });
  });

  it('supports AccountSelector in form', () => {
    elementDataGetters.getSelectedAccount.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });

    elementDataGetters.getAccountByAddress.mockImplementation(
      (caipAccountId: CaipAccountId) => {
        const { address } = parseCaipAccountId(caipAccountId);
        return {
          id: MOCK_ACCOUNT_ID,
          address,
          scopes: ['eip155:0'],
        };
      },
    );

    const element = (
      <Box>
        <Form name="form">
          <Field label="foo">
            <AccountSelector
              name="foo"
              value="eip155:0:0x1234567890123456789012345678901234567890"
            />
          </Field>
        </Form>
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);
    expect(result).toStrictEqual({
      form: {
        foo: {
          accountId: MOCK_ACCOUNT_ID,
          addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
        },
      },
    });
  });

  it('sets the selected account to the currently selected account if the account does not exist for AccountSelector', () => {
    elementDataGetters.getSelectedAccount.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });

    elementDataGetters.getAccountByAddress.mockReturnValue(undefined);

    const element = (
      <Box>
        <AccountSelector
          name="foo"
          value="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6"
        />
      </Box>
    );

    const result = constructState({}, element, elementDataGetters);

    expect(result).toStrictEqual({
      foo: {
        accountId: MOCK_ACCOUNT_ID,
        addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
      },
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
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        ],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
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
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        ],
      },
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
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        ],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
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
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        ],
      },
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

  it('sets the value to the default asset if the asset metadata is not found', () => {
    elementDataGetters.getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
    });

    const element = (
      <Box>
        <AssetSelector
          name="foo"
          addresses={[
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ]}
          value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
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
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    elementDataGetters.getAccountByAddress.mockReturnValue({
      id: MOCK_ACCOUNT_ID,
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
  const getAssetsState = jest.fn();

  it('returns the asset selector state value', () => {
    getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetsState,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('returns null if the value is not set', () => {
    expect(getAssetSelectorStateValue(undefined, getAssetsState)).toBeNull();
  });

  it('returns null if the asset metadata is not found', () => {
    getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            name: 'USDC',
            symbol: 'USDC',
          },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetsState,
      ),
    ).toBeNull();
  });

  it('sets the asset name to the symbol if the asset name is undefined in state', () => {
    getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          symbol: 'SOL',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetsState,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'SOL',
      symbol: 'SOL',
    });
  });

  it('sets the asset symbol to "Unknown" if the asset symbol is undefined in state', () => {
    getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          name: 'Solana',
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetsState,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'Unknown',
    });
  });

  it('sets the asset symbol and name to "Unknown" if both are undefined in state', () => {
    getAssetsState.mockReturnValue({
      assetsMetadata: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
          fungible: true,
        },
      },
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    expect(
      getAssetSelectorStateValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        getAssetsState,
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Unknown',
      symbol: 'Unknown',
    });
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
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        ],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
    });

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        {
          getAssetsState,
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
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
        [MOCK_ACCOUNT_ID]: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
    });

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        {
          getAssetsState,
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      asset:
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USDC',
      symbol: 'USDC',
    });
  });

  it('returns undefined if no assets are available', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {},
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
    });

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        {
          getAssetsState,
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toBeNull();
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
        [MOCK_ACCOUNT_ID]: [
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1/slip44:501',
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
        ],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
    });

    expect(
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        {
          getAssetsState,
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      asset: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      name: 'Solana',
      symbol: 'SOL',
    });
  });

  it('throws if the account is not found', () => {
    const getAssetsState = jest.fn().mockReturnValue({
      assetsMetadata: {},
      accountsAssets: {
        [MOCK_ACCOUNT_ID]: [],
      },
    });

    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    expect(() =>
      getDefaultAsset(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        undefined,
        {
          getAssetsState,
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toThrow(
      'Account not found for address: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv.',
    );
  });
});

describe('isStatefulComponent', () => {
  it.each([
    <Input name="foo" />,
    <Dropdown name="foo">
      <Option value="option1">Option 1</Option>
    </Dropdown>,
    <RadioGroup name="foo">
      <Radio value="option1">Option 1</Radio>
    </RadioGroup>,
    <Checkbox name="foo" />,
    <Selector name="foo" title="Choose an option">
      <SelectorOption value="option1">
        <Text>Option 1</Text>
      </SelectorOption>
    </Selector>,
    <AssetSelector
      name="foo"
      addresses={[
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ]}
    />,
    <FileInput name="foo" />,
    <AddressInput name="foo" chainId="eip155:1" />,
  ])('returns true for "%p"', () => {
    expect(isStatefulComponent(<Input name="foo" />)).toBe(true);
  });

  it('returns false for stateless components', () => {
    expect(isStatefulComponent(<Text>foo</Text>)).toBe(false);
  });

  it('returns false for nested stateful components', () => {
    expect(
      isStatefulComponent(
        <Box>
          <Input name="foo" />
        </Box>,
      ),
    ).toBe(false);
  });
});

describe('matchingChainId', () => {
  it('returns true if one of the chain IDs match the scope', () => {
    expect(
      matchingChainId('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      ]),
    ).toBe(true);
  });

  it('returns false if none of the chain IDs match the scope', () => {
    expect(
      matchingChainId('bip122:000000000019d6689c085ae165831e93', [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      ]),
    ).toBe(false);
  });

  it('returns true if one of the chain ID has the `eip-155` namespace and the scope is `eip-155:0`', () => {
    expect(matchingChainId('eip155:0', ['eip155:1'])).toBe(true);
  });
});

describe('formatAccountSelectorStateValue', () => {
  it('formats the account selector state value', () => {
    expect(
      // @ts-expect-error partial mock
      formatAccountSelectorStateValue({
        id: MOCK_ACCOUNT_ID,
        address: '0x1234567890123456789012345678901234567890',
        scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
      }),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: [
        'eip155:1:0x1234567890123456789012345678901234567890',
        'eip155:2:0x1234567890123456789012345678901234567890',
        'eip155:3:0x1234567890123456789012345678901234567890',
      ],
    });
  });
});

describe('getAccountSelectorDefaultStateValue', () => {
  it('returns the currently selected account in the client if no chain Is are defined', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });
    expect(
      getAccountSelectorDefaultStateValue(<AccountSelector name="foo" />, {
        getSelectedAccount,
        getAccountByAddress: jest.fn(),
        getAssetsState: jest.fn(),
        listAccounts: jest.fn(),
        snapOwnsAccount: jest.fn(),
      }),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: ['eip155:0:0x1234567890123456789012345678901234567890'],
    });
  });

  it('returns the currently selected account in the client if chain IDs match', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:0'],
    });
    expect(
      getAccountSelectorDefaultStateValue(
        <AccountSelector name="foo" chainIds={['eip155:1']} />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
    });
  });

  it('returns the first account of the accounts that matches the chain Ids if the selected account is not on the same chain ID', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    const listAccounts = jest.fn().mockReturnValue([
      {
        id: MOCK_ACCOUNT_ID,
        address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      },
      {
        id: MOCK_ACCOUNT_ID,
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      },
    ]);

    expect(
      getAccountSelectorDefaultStateValue(
        <AccountSelector
          name="foo"
          chainIds={['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']}
        />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts,
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ],
    });
  });

  it('returns the currently selected account in the client if the snap owns the account', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
    });

    const snapOwnsAccount = jest.fn().mockReturnValue(true);
    expect(
      getAccountSelectorDefaultStateValue(
        <AccountSelector
          name="foo"
          hideExternalAccounts
          chainIds={['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']}
        />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount,
        },
      ),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ],
    });
  });

  it('returns the first account of the accounts that matches the chain Ids and that is owned by the snap if the selected account is not on the same chain ID', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    const listAccounts = jest.fn().mockReturnValue([
      {
        id: MOCK_ACCOUNT_ID,
        address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      },
      {
        id: MOCK_ACCOUNT_ID,
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      },
    ]);

    const snapOwnsAccount = jest.fn().mockReturnValue(true);

    expect(
      getAccountSelectorDefaultStateValue(
        <AccountSelector
          name="foo"
          hideExternalAccounts
          chainIds={['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']}
        />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts,
          snapOwnsAccount,
        },
      ),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ],
    });
  });

  it('throws if no account is found for the given chain IDs', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    const listAccounts = jest.fn().mockReturnValue([]);

    expect(() =>
      getAccountSelectorDefaultStateValue(
        <AccountSelector
          name="foo"
          chainIds={['bip122:000000000019d6689c085ae165831e93']}
        />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts,
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toThrow('No accounts found for the provided chain IDs.');
  });

  it('throws if no account that the snap owns is found for the given chain IDs', () => {
    const getSelectedAccount = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    const listAccounts = jest.fn().mockReturnValue([]);

    const snapOwnsAccount = jest.fn().mockReturnValue(false);

    expect(() =>
      getAccountSelectorDefaultStateValue(
        <AccountSelector
          name="foo"
          hideExternalAccounts
          chainIds={['bip122:000000000019d6689c085ae165831e93']}
        />,
        {
          getSelectedAccount,
          getAccountByAddress: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts,
          snapOwnsAccount,
        },
      ),
    ).toThrow('No accounts found for the provided chain IDs.');
  });
});

describe('getAccountSelectorStateValue', () => {
  it('returns the account selector state value', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    expect(
      getAccountSelectorStateValue(
        <AccountSelector
          name="foo"
          value="eip155:1:0x1234567890123456789012345678901234567890"
        />,
        {
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toStrictEqual({
      accountId: MOCK_ACCOUNT_ID,
      addresses: [
        'eip155:1:0x1234567890123456789012345678901234567890',
        'eip155:2:0x1234567890123456789012345678901234567890',
        'eip155:3:0x1234567890123456789012345678901234567890',
      ],
    });
  });

  it('returns null if the account is not owned by the snap', () => {
    const getAccountByAddress = jest.fn().mockReturnValue({
      id: MOCK_ACCOUNT_ID,
      address: '0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1', 'eip155:2', 'eip155:3'],
    });

    const snapOwnsAccount = jest.fn().mockReturnValue(false);

    expect(
      getAccountSelectorStateValue(
        <AccountSelector
          name="foo"
          hideExternalAccounts
          value="eip155:1:0x1234567890123456789012345678901234567890"
        />,
        {
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount,
        },
      ),
    ).toBeNull();
  });

  it('returns null if the account is not found', () => {
    const getAccountByAddress = jest.fn().mockReturnValue(undefined);

    expect(
      getAccountSelectorStateValue(
        <AccountSelector
          name="foo"
          value="eip155:1:0x1234567890123456789012345678901234567890"
        />,
        {
          getAccountByAddress,
          getSelectedAccount: jest.fn(),
          getAssetsState: jest.fn(),
          listAccounts: jest.fn(),
          snapOwnsAccount: jest.fn(),
        },
      ),
    ).toBeNull();
  });
});
