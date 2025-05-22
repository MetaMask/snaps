import { assert } from '@metamask/snaps-sdk';
import type {
  FormState,
  InterfaceState,
  ComponentOrElement,
  InterfaceContext,
  State,
  FungibleAssetMetadata,
  AssetSelectorState,
  CaipChainId,
} from '@metamask/snaps-sdk';
import type {
  DropdownElement,
  InputElement,
  JSXElement,
  OptionElement,
  FileInputElement,
  CheckboxElement,
  RadioGroupElement,
  RadioElement,
  SelectorElement,
  SelectorOptionElement,
  AssetSelectorElement,
  AddressInputElement,
  AccountSelectorElement,
} from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe } from '@metamask/snaps-sdk/jsx';
import type { InternalAccount } from '@metamask/snaps-utils';
import {
  createAccountList,
  createChainIdList,
  getJsonSizeUnsafe,
  getJsxChildren,
  getJsxElementFromComponent,
  walkJsx,
} from '@metamask/snaps-utils';
import {
  type CaipAssetType,
  type CaipAccountId,
  parseCaipAccountId,
  parseCaipAssetType,
  toCaipAccountId,
  parseCaipChainId,
  KnownCaipNamespace,
} from '@metamask/utils';

/**
 * A list of stateful component types.
 */
const STATEFUL_COMPONENT_TYPES = [
  'Input',
  'Dropdown',
  'RadioGroup',
  'FileInput',
  'Checkbox',
  'Selector',
  'AssetSelector',
  'AddressInput',
  'AccountSelector',
] as const;

/**
 * Type for stateful component types.
 */
type StatefulComponentType = (typeof STATEFUL_COMPONENT_TYPES)[number];

/**
 * Check if a component is a stateful component.
 *
 * @param component - The component to check.
 * @param component.type - The type of the component.
 *
 * @returns Whether the component is a stateful component.
 */
export function isStatefulComponent(component: { type: string }): component is {
  type: StatefulComponentType;
} {
  return STATEFUL_COMPONENT_TYPES.includes(
    component.type as StatefulComponentType,
  );
}

/**
 * A function to get the MultichainAssetController state.
 *
 * @returns The MultichainAssetController state.
 */
type GetAssetsState = () => {
  assetsMetadata: {
    [asset: CaipAssetType]: FungibleAssetMetadata;
  };
  accountsAssets: { [account: string]: CaipAssetType[] };
};

/**
 * A function to get an account by its address.
 *
 * @param address - The account address.
 * @returns The account or undefined if not found.
 */
type GetAccountByAddress = (
  address: CaipAccountId,
) => InternalAccount | undefined;

/**
 * A function to get the selected account in the client.
 *
 * @returns The selected account.
 */
type GetSelectedAccount = () => InternalAccount;

/**
 * A function to get accounts for the provided chain IDs.
 */
type ListAccounts = (chainIds?: CaipChainId[]) => InternalAccount[];

/**
 * A function to check if the snap owns the account.
 */
type SnapOwnsAccount = (account: InternalAccount) => boolean;

/**
 * Data getters for elements.
 * This is used to get data from elements that is not directly accessible from the element itself.
 *
 * @param getAssetState - A function to get the MultichainAssetController state.
 * @param getAccountByAddress - A function to get an account by its address.
 * @param getSelectedAccount - A function to get the selected account in the client.
 * @param listAccounts - A function to list accounts for the provided chain IDs.
 * @param snapOwnsAccount - A function to check if the snap owns the account.
 */
type ElementDataGetters = {
  getAssetsState: GetAssetsState;
  getAccountByAddress: GetAccountByAddress;
  getSelectedAccount: GetSelectedAccount;
  listAccounts: ListAccounts;
  snapOwnsAccount: SnapOwnsAccount;
};

/**
 * Get a JSX element from a component or JSX element. If the component is a
 * JSX element, it is returned as is. Otherwise, the component is converted to
 * a JSX element.
 *
 * @param component - The component to convert.
 * @returns The JSX element.
 */
export function getJsxInterface(component: ComponentOrElement): JSXElement {
  if (isJSXElementUnsafe(component)) {
    return component;
  }

  return getJsxElementFromComponent(component);
}

/**
 * Assert that the component name is unique in state.
 *
 * @param state - The interface state to verify against.
 * @param name - The component name to verify.
 */
export function assertNameIsUnique(state: InterfaceState, name: string) {
  assert(
    state[name] === undefined,
    `Duplicate component names are not allowed, found multiple instances of: "${name}".`,
  );
}

/**
 * Check if the chain ID matches the scope.
 * This function handles the case where a scope represents all EVM compatible chains.
 * In this case, it returns true if the chain ID is an EIP-155 chain ID.
 *
 * @param scope - The scope to check.
 * @param chainIds - The chain IDs to check against.
 * @returns Whether one of the chain ID matches the scope.
 */
export function isMatchingChainId(scope: CaipChainId, chainIds: CaipChainId[]) {
  // if the scope represents all EVM compatible chains, return true if the namespace is EIP-155.
  if (scope === 'eip155:0') {
    return chainIds.some((chainId) => {
      const { namespace } = parseCaipChainId(chainId);
      return namespace === KnownCaipNamespace.Eip155;
    });
  }

  // Otherwise, check if the scope is in the chain IDs.
  return chainIds.includes(scope);
}

/**
 * Format the state value for an account selector.
 *
 * @param account - The account to format.
 * @param requestedChainIds - The requested chain IDs.
 *
 * @returns The state value for the account selector.
 */
export function formatAccountSelectorStateValue(
  account: InternalAccount,
  requestedChainIds?: CaipChainId[],
) {
  const { id, address, scopes } = account;

  const chainIds = createChainIdList(scopes, requestedChainIds);
  const addresses = createAccountList(address, chainIds);

  return { accountId: id, addresses };
}

/**
 * Get a default asset for a given address.
 *
 * @param addresses - The account addresses.
 * @param chainIds - The chain IDs to filter the assets.
 * @param elementDataGetters - Data getters for the element.
 * @param elementDataGetters.getAccountByAddress - A function to get an account by its address.
 * @param elementDataGetters.getAssetsState - A function to get the MultichainAssetController state.
 *
 * @returns The default asset for the account or undefined if not found.
 */
export function getDefaultAsset(
  addresses: CaipAccountId[],
  chainIds: CaipChainId[] | undefined,
  { getAccountByAddress, getAssetsState }: ElementDataGetters,
) {
  const { assetsMetadata, accountsAssets } = getAssetsState();

  const parsedAccounts = addresses.map((address) =>
    parseCaipAccountId(address),
  );

  const accountChainIds = parsedAccounts.map(({ chainId }) => chainId);

  const filteredChainIds =
    chainIds && chainIds.length > 0
      ? accountChainIds.filter((accountChainId) =>
          chainIds.includes(accountChainId),
        )
      : accountChainIds;

  const accountId = getAccountByAddress(addresses[0])?.id;

  // We should never fail on this assertion as the address is already validated.
  assert(accountId, `Account not found for address: ${addresses[0]}.`);

  const accountAssets = accountsAssets[accountId];

  // The AssetSelector component in the UI will be disabled if there is no asset available for the account
  // and networks provided. In this case, we return null to indicate that there is no default selected asset.
  if (accountAssets.length === 0) {
    return null;
  }

  const nativeAsset = accountAssets.find((asset) => {
    const { chainId, assetNamespace } = parseCaipAssetType(asset);

    return filteredChainIds.includes(chainId) && assetNamespace === 'slip44';
  });

  if (nativeAsset) {
    return {
      asset: nativeAsset,
      name: assetsMetadata[nativeAsset].name,
      symbol: assetsMetadata[nativeAsset].symbol,
    };
  }

  return {
    asset: accountAssets[0],
    name: assetsMetadata[accountAssets[0]].name,
    symbol: assetsMetadata[accountAssets[0]].symbol,
  };
}

/**
 * Get the default state value for an account selector.
 *
 * @param element - The account selector element.
 * @param elementDataGetters - Data getters for the element.
 * @param elementDataGetters.getSelectedAccount - A function to get the selected account in the client.
 * @param elementDataGetters.listAccounts - A function to list accounts for the provided chain IDs.
 * @param elementDataGetters.snapOwnsAccount - A function to check if the snap owns the account.
 * @returns The default state for the account selector.
 */
export function getAccountSelectorDefaultStateValue(
  element: AccountSelectorElement,
  { getSelectedAccount, listAccounts, snapOwnsAccount }: ElementDataGetters,
) {
  const { chainIds, hideExternalAccounts } = element.props;

  const selectedAccount = getSelectedAccount();

  // Use the selected account if it matches.
  // The following conditions are checked:
  // - If the selected account has any of the requested chain IDs in its scopes.
  // - If the selected account is owned by the snap and hideExternalAccounts is true.
  if (
    (!chainIds ||
      chainIds.length === 0 ||
      selectedAccount.scopes.some((scope) =>
        isMatchingChainId(scope, chainIds),
      )) &&
    (!hideExternalAccounts ||
      (hideExternalAccounts && snapOwnsAccount(selectedAccount)))
  ) {
    return formatAccountSelectorStateValue(selectedAccount, chainIds);
  }

  const accounts = listAccounts(chainIds);

  const filteredAccounts = hideExternalAccounts
    ? accounts.filter((account) => snapOwnsAccount(account))
    : accounts;

  // The AccountSelector component in the UI will be disabled if there is no account available for the networks provided.
  // In this case, we return null to indicate that there is no default selected account.
  if (filteredAccounts.length === 0) {
    return null;
  }

  return formatAccountSelectorStateValue(filteredAccounts[0], chainIds);
}

/**
 * Construct default state for a component.
 *
 * This function is meant to be used inside constructInputState to account
 * for component specific defaults and will not override the component value or existing form state.
 *
 * @param element - The input element.
 * @param elementDataGetters - Data getters for the element.
 *
 * @returns The default state for the specific component, if any.
 */
function constructComponentSpecificDefaultState(
  element:
    | InputElement
    | DropdownElement
    | RadioGroupElement
    | CheckboxElement
    | SelectorElement
    | AssetSelectorElement
    | AddressInputElement
    | AccountSelectorElement,
  elementDataGetters: ElementDataGetters,
) {
  switch (element.type) {
    case 'Dropdown': {
      const children = getJsxChildren(element) as OptionElement[];
      return children[0]?.props.value;
    }

    case 'RadioGroup': {
      const children = getJsxChildren(element) as RadioElement[];
      return children[0]?.props.value;
    }

    case 'Selector': {
      const children = getJsxChildren(element) as SelectorOptionElement[];
      return children[0]?.props.value;
    }

    case 'AccountSelector':
      return getAccountSelectorDefaultStateValue(element, elementDataGetters);

    case 'Checkbox':
      return false;

    case 'AssetSelector':
      return getDefaultAsset(
        element.props.addresses,
        element.props.chainIds,
        elementDataGetters,
      );

    default:
      return null;
  }
}

/**
 * Get the state value for an asset selector.
 *
 * @param value - The asset selector value.
 * @param getAssetState - A function to get the MultichainAssetController state.
 * @returns The state value for the asset selector or null.
 */
export function getAssetSelectorStateValue(
  value: CaipAssetType | undefined,
  getAssetState: GetAssetsState,
): AssetSelectorState | null {
  if (!value) {
    return null;
  }

  const { assetsMetadata } = getAssetState();
  const asset = assetsMetadata[value];

  if (!asset) {
    return null;
  }

  return {
    asset: value,
    name: asset.name ?? asset.symbol ?? 'Unknown',
    symbol: asset.symbol ?? 'Unknown',
  };
}

/**
 * Get the state value for an account selector.
 *
 * @param element - The account selector element.
 * @param elementDataGetters - Data getters for the element.
 * @param elementDataGetters.getAccountByAddress - A function to get an account by address.
 * @param elementDataGetters.snapOwnsAccount - A function to check if the snap owns the account.
 * @returns The state value for the account selector.
 */
export function getAccountSelectorStateValue(
  element: AccountSelectorElement,
  { getAccountByAddress, snapOwnsAccount }: ElementDataGetters,
) {
  const { value, hideExternalAccounts } = element.props;

  if (!value) {
    return null;
  }

  const account = getAccountByAddress(value);

  if (!account) {
    return null;
  }

  if (hideExternalAccounts && !snapOwnsAccount(account)) {
    return null;
  }

  return formatAccountSelectorStateValue(account, element.props.chainIds);
}

/**
 * Get the state value for a stateful component.
 *
 * Most components store the state value as a `value` prop.
 * This function exists to account for components where that isn't the case.
 *
 * @param element - The input element.
 * @param elementDataGetters - Data getters for the element.
 * @returns The state value for a given component.
 */
function getComponentStateValue(
  element:
    | InputElement
    | DropdownElement
    | RadioGroupElement
    | CheckboxElement
    | SelectorElement
    | AssetSelectorElement
    | AddressInputElement
    | AccountSelectorElement,
  elementDataGetters: ElementDataGetters,
) {
  switch (element.type) {
    case 'Checkbox':
      return element.props.checked;

    case 'AssetSelector':
      return getAssetSelectorStateValue(
        element.props.value,
        elementDataGetters.getAssetsState,
      );

    case 'AddressInput': {
      if (!element.props.value) {
        return null;
      }

      // Construct CAIP-10 Id
      const { namespace, reference } = parseCaipChainId(element.props.chainId);
      return toCaipAccountId(namespace, reference, element.props.value);
    }

    case 'AccountSelector':
      return getAccountSelectorStateValue(element, elementDataGetters);

    default:
      return element.props.value;
  }
}

/**
 * Construct the state for an input field.
 *
 * @param oldState - The previous state.
 * @param element - The input element.
 * @param elementDataGetters - Data getters for the element.
 * @param form - An optional form that the input is enclosed in.
 * @returns The input state.
 */
function constructInputState(
  oldState: InterfaceState,
  element:
    | InputElement
    | DropdownElement
    | RadioGroupElement
    | FileInputElement
    | CheckboxElement
    | SelectorElement
    | AssetSelectorElement
    | AddressInputElement
    | AccountSelectorElement,
  elementDataGetters: ElementDataGetters,
  form?: string,
) {
  const oldStateUnwrapped = form ? (oldState[form] as FormState) : oldState;
  const oldInputState = oldStateUnwrapped?.[element.props.name] as State;

  if (element.type === 'FileInput') {
    return oldInputState ?? null;
  }

  return (
    getComponentStateValue(element, elementDataGetters) ??
    oldInputState ??
    constructComponentSpecificDefaultState(element, elementDataGetters) ??
    null
  );
}

/**
 * Construct the interface state for a given component tree.
 *
 * @param oldState - The previous state.
 * @param rootComponent - The UI component to construct state from.
 * @param elementDataGetters - Data getters for the elements.
 * @returns The interface state of the passed component.
 */
export function constructState(
  oldState: InterfaceState,
  rootComponent: JSXElement,
  elementDataGetters: ElementDataGetters,
): InterfaceState {
  const newState: InterfaceState = {};

  // Stack containing the forms we have visited and at which depth
  const formStack: { name: string; depth: number }[] = [];

  walkJsx(rootComponent, (component, depth) => {
    let currentForm = formStack[formStack.length - 1];

    // Pop the current form of the stack once we leave its depth.
    if (currentForm && depth <= currentForm.depth) {
      formStack.pop();
      currentForm = formStack[formStack.length - 1];
    }

    if (component.type === 'Form') {
      assertNameIsUnique(newState, component.props.name);
      formStack.push({ name: component.props.name, depth });
      newState[component.props.name] = {};
      return;
    }

    // Stateful components inside a form
    if (currentForm && isStatefulComponent(component)) {
      const formState = newState[currentForm.name] as FormState;
      assertNameIsUnique(formState, component.props.name);
      formState[component.props.name] = constructInputState(
        oldState,
        component,
        elementDataGetters,
        currentForm.name,
      );
      return;
    }

    // Stateful components outside a form
    if (isStatefulComponent(component)) {
      assertNameIsUnique(newState, component.props.name);
      newState[component.props.name] = constructInputState(
        oldState,
        component,
        elementDataGetters,
      );
    }
  });

  return newState;
}

const MAX_CONTEXT_SIZE = 5_000_000; // 5 mb

/**
 * Validate a JSON blob to be used as the interface context.
 *
 * @param context - The JSON blob.
 * @throws If the JSON blob is too large.
 */
export function validateInterfaceContext(context?: InterfaceContext) {
  if (!context) {
    return;
  }

  // We assume the validity of this JSON to be validated by the caller.
  // E.g., in the RPC method implementation.
  const size = getJsonSizeUnsafe(context);
  assert(
    size <= MAX_CONTEXT_SIZE,
    `A Snap interface context may not be larger than ${
      MAX_CONTEXT_SIZE / 1000000
    } MB.`,
  );
}
