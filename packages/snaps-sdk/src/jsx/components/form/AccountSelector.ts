import type { CaipAccountAddress, CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AccountSelector} component.
 *
 * @property name - The name of the account selector. This is used to identify the
 * state in the form data.
 * @property title - The title of the account selector. This is displayed in the UI.
 * @property chainId - The chain ID of the account selector. This should be a valid CAIP-2 chain ID.
 * @property selectedAddress - The default selected address of the account selector. This should be a
 * valid CAIP-10 account address.
 */
export type AccountSelectorProps = {
  name: string;
  title: string;
  chainId: CaipChainId;
  selectedAddress: CaipAccountAddress;
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
 * @param props.title - The title of the account selector field. This is displayed in the UI.
 * @param props.chainId - The chain ID of the account selector. This should be a valid CAIP-2 chain ID.
 * @param props.selectedAddress - The selected address of the account selector. This should be a
 * valid CAIP-10 account address.
 * @returns An account selector element.
 * @example
 * <AccountSelector name="account" title="From account" chainId="eip155:1" selectedAddress="0x1234567890123456789012345678901234567890" />
 * @example
 * <AccountSelector name="account" title="From account" chainId="bip122:000000000019d6689c085ae165831e93" selectedAddress="128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />
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
