import type { CaipAccountAddress, CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AccountPicker} component.
 *
 * @property name - The name of the account picker. This is used to identify the
 * state in the form data.
 * @property title - The title of the account picker. This is displayed in the UI.
 * @property chainId - The chain ID of the account picker. This should be a valid CAIP-2 chain ID.
 * @property selectedAddress - The default selected address of the account picker. This should be a
 * valid CAIP-10 account address.
 */
export type AccountPickerProps = {
  name: string;
  title: string;
  chainId: CaipChainId;
  selectedAddress: CaipAccountAddress;
};

const TYPE = 'AccountPicker';

/**
 * An account picker component, which is used to create an account picker.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the account picker field. This is used to identify the
 * state in the form data.
 * @param props.title - The title of the account picker field. This is displayed in the UI.
 * @param props.chainId - The chain ID of the account picker. This should be a valid CAIP-2 chain ID.
 * @param props.selectedAddress - The selected address of the account picker. This should be a
 * valid CAIP-10 account address.
 * @returns An account picker element.
 * @example
 * <AccountPicker name="account" title="From account" chainId="eip155:1" selectedAddress="0x1234567890123456789012345678901234567890" />
 * @example
 * <AccountPicker name="account" title="From account" chainId="bip122:000000000019d6689c085ae165831e93" selectedAddress="128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />
 */
export const AccountPicker = createSnapComponent<
  AccountPickerProps,
  typeof TYPE
>(TYPE);

/**
 * An account picker element.
 *
 * @see AccountPicker
 */
export type AccountPickerElement = ReturnType<typeof AccountPicker>;
