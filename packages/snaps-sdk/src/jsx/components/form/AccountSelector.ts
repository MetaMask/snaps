import type { CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AccountSelector} component.
 *
 * @property name - The name of the account selector. This is used to identify the
 * state in the form data.
 * @property chainIds - The chain IDs of the account selector. This should be a valid CAIP-2 chain ID array.
 * @property selectedAccount - The default selected account of the account selector. This should be a
 * valid account ID.
 */
export type AccountSelectorProps = {
  name: string;
  chainIds: CaipChainId[];
  selectedAccount: string;
};

const TYPE = 'AccountSelector';

/**
 * An account selector component, which is used to create an account selector.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the account selector field. This is used to identify the
 * state in the form data.
 * @param props.chainIds - The chain IDs of the account selector. This should be a valid CAIP-2 chain ID array.
 * @param props.selectedAccount - The default selected account of the account selector. This should be a
 * valid account ID.
 * @returns An account selector element.
 * @example
 * <AccountSelector name="account" chainIds={["eip155:1"]} selectedAccount="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed" />
 * @example
 * <AccountSelector name="account" chainIds={["bip122:000000000019d6689c085ae165831e93"]} selectedAccount="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed" />
 */
export const AccountSelector = createSnapComponent<
  AccountSelectorProps,
  typeof TYPE
>(TYPE);

/**
 * An account selector element.
 *
 * @see AccountSelector
 */
export type AccountSelectorElement = ReturnType<typeof AccountSelector>;
