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
} from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe } from '@metamask/snaps-sdk/jsx';
import type { InternalAccount } from '@metamask/snaps-utils';
import {
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
} from '@metamask/utils';

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
 * Data getters for elements.
 * This is used to get data from elements that is not directly accessible from the element itself.
 *
 * @param getAssetState - A function to get the MultichainAssetController state.
 * @param getAccountByAddress - A function to get an account by its address.
 */
type ElementDataGetters = {
  getAssetsState: GetAssetsState;
  getAccountByAddress: GetAccountByAddress;
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
    | AssetSelectorElement,
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
    name: asset.name,
    symbol: asset.symbol,
  };
}

/**
 * Get the state value for a stateful component.
 *
 * Most components store the state value as a `value` prop.
 * This function exists to account for components where that isn't the case.
 *
 * @param element - The input element.
 * @param elementDataGetters - Data getters for the element.
 * @param elementDataGetters.getAssetsState - A function to get the MultichainAssetController state.
 * @returns The state value for a given component.
 */
function getComponentStateValue(
  element:
    | InputElement
    | DropdownElement
    | RadioGroupElement
    | CheckboxElement
    | SelectorElement
    | AssetSelectorElement,
  { getAssetsState }: ElementDataGetters,
) {
  switch (element.type) {
    case 'Checkbox':
      return element.props.checked;

    case 'AssetSelector':
      return getAssetSelectorStateValue(element.props.value, getAssetsState);

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
    | AssetSelectorElement,
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
    // TODO: This is becoming a bit of a mess, we should consider refactoring this.
    if (
      currentForm &&
      (component.type === 'Input' ||
        component.type === 'Dropdown' ||
        component.type === 'RadioGroup' ||
        component.type === 'FileInput' ||
        component.type === 'Checkbox' ||
        component.type === 'Selector' ||
        component.type === 'AssetSelector')
    ) {
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
    // TODO: This is becoming a bit of a mess, we should consider refactoring this.
    if (
      component.type === 'Input' ||
      component.type === 'Dropdown' ||
      component.type === 'RadioGroup' ||
      component.type === 'FileInput' ||
      component.type === 'Checkbox' ||
      component.type === 'Selector' ||
      component.type === 'AssetSelector'
    ) {
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

const MAX_CONTEXT_SIZE = 1_000_000; // 1 mb

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
