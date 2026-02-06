import type { CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AddressInput} component.
 *
 * @property name - The name of the input field.
 * @property value - The value of the input field.
 * @property chainId - The CAIP-2 chain ID of the address.
 * @property placeholder - The placeholder text of the input field.
 * @property disabled - Whether the input field is disabled.
 * @property displayAvatar - Whether to display the avatar of the address.
 * @category Component Props
 */
export type AddressInputProps = {
  name: string;
  value?: string | undefined;
  chainId: CaipChainId;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  displayAvatar?: boolean | undefined;
};

const TYPE = 'AddressInput';

/**
 * An input component for entering an address. Resolves the address to a display name and avatar.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the input field.
 * @param props.value - The value of the input field.
 * @param props.chainId - The CAIP-2 chain ID of the address.
 * @param props.placeholder - The placeholder text of the input field.
 * @param props.disabled - Whether the input field is disabled.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @returns An input element.
 * @example
 * <AddressInput name="address" value="0x1234567890123456789012345678901234567890" chainId="eip155:1" />
 * @category Components
 */
export const AddressInput = createSnapComponent<AddressInputProps, typeof TYPE>(
  TYPE,
);

/**
 * An address input element.
 *
 * @see {@link AddressInput}
 * @category Elements
 */
export type AddressInputElement = ReturnType<typeof AddressInput>;
