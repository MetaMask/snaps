import type { InternalAccount } from '@metamask/keyring-internal-api';
import { assert } from '@metamask/snaps-sdk';
import type {
  FormState,
  InterfaceState,
  ComponentOrElement,
  InterfaceContext,
  State,
  FungibleAssetMetadata,
  AssetSelectorState,
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
import {
  getJsonSizeUnsafe,
  getJsxChildren,
  getJsxElementFromComponent,
  walkJsx,
} from '@metamask/snaps-utils';
import { type CaipAssetType, type CaipAccountId } from '@metamask/utils';

/**
 * A function to get asset metadata.
 *
 * @param assetId - The asset ID.
 * @returns The asset metadata or undefined if not found.
 */
type GetAssetMetadata = (
  assetId: CaipAssetType,
) => FungibleAssetMetadata | undefined;

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
 * @param getAssetMetadata - A function to get asset metadata.
 */
type ElementDataGetters = {
  getAssetMetadata: GetAssetMetadata;
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
 * Validate the asset selector component.
 *
 * @param node - The JSX node to validate.
 * @param getAccountByAddress - A function to get an account by its address.
 *
 * @throws If the asset selector is invalid.
 */
export function validateAssetSelector(
  node: JSXElement,
  getAccountByAddress: GetAccountByAddress,
) {
  walkJsx(node, (childNode) => {
    if (childNode.type !== 'AssetSelector') {
      return;
    }

    // We can assume that the addresses are the same for all CAIP account IDs
    const account = getAccountByAddress(childNode.props.addresses[0]);

    assert(
      account,
      `Could not find account for address: ${childNode.props.addresses[0]}`,
    );
  });
}

/**
 * Construct default state for a component.
 *
 * This function is meant to be used inside constructInputState to account
 * for component specific defaults and will not override the component value or existing form state.
 *
 * @param element - The input element.
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

    default:
      return null;
  }
}

/**
 * Get the state value for an asset selector.
 *
 * @param value - The asset selector value.
 * @param getAssetMetadata - A function to get asset metadata.
 * @returns The state value for the asset selector or null.
 */
export function getAssetSelectorStateValue(
  value: CaipAssetType | undefined,
  getAssetMetadata: GetAssetMetadata,
): AssetSelectorState | null {
  if (!value) {
    return null;
  }

  const asset = getAssetMetadata(value);

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
  elementDataGetters: ElementDataGetters,
) {
  switch (element.type) {
    case 'Checkbox':
      return element.props.checked;

    case 'AssetSelector':
      return getAssetSelectorStateValue(
        element.props.value,
        elementDataGetters.getAssetMetadata,
      );

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
    constructComponentSpecificDefaultState(element) ??
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
