import type { CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

export type AddressInputProps = {
  name: string;
  value?: string | undefined;
  chainId: CaipChainId;
};

const TYPE = 'AddressInput';

/**
 * An input component for entering an address. Resolves the address to a display name and avatar.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the input field.
 * @param props.value - The value of the input field.
 * @param props.chainId - The CAIP-2 chain ID of the address.
 * @returns An input element.
 * @example
 * <AddressInput name="address" value="0x1234567890123456789012345678901234567890" chainId="eip155:1" />
 */
export const AddressInput = createSnapComponent<AddressInputProps, typeof TYPE>(
  TYPE,
);

export type AddressInputElement = ReturnType<typeof AddressInput>;
