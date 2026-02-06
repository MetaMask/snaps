import type { CaipAccountId } from '@metamask/utils';

import { createSnapComponent } from '../component';

/**
 * The props of the {@link Address} component.
 *
 * @property address - The (Ethereum) address to display. This should be a
 * valid Ethereum address, starting with `0x`, or a valid CAIP-10 address.
 * @property truncate - Whether to truncate the address. Defaults to `true`.
 * @property displayName - Whether to show the account name. Defaults to `false`.
 * @property avatar - Whether to show the address avatar. Defaults to `true`.
 * @category Component Props
 */
export type AddressProps = {
  address: `0x${string}` | CaipAccountId;
  truncate?: boolean | undefined;
  displayName?: boolean | undefined;
  avatar?: boolean | undefined;
};

const TYPE = 'Address';

/**
 * An address component, which is used to display a CAIP-10 address or a Ethereum address.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.address - The address to display. This should be a
 * valid Ethereum address, starting with `0x`, or a valid CAIP-10 address.
 * @param props.truncate - Whether to truncate the address. Defaults to `true`.
 * @param props.displayName - Whether to show the account name. Defaults to `false`.
 * @param props.avatar - Whether to show the address avatar. Defaults to `true`.
 * @returns An address element.
 * @example
 * <Address address="0x1234567890123456789012345678901234567890" />
 * @example
 * <Address address="eip155:1:0x1234567890123456789012345678901234567890" />
 * @example
 * <Address address="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />
 * @example
 * <Address address="0x1234567890123456789012345678901234567890" truncate={false} avatar={false} />
 * @example
 * <Address address="0x1234567890123456789012345678901234567890" displayName={true} />
 * @category Components
 */
export const Address = createSnapComponent<AddressProps, typeof TYPE>(TYPE);

/**
 * An address element.
 *
 * @see {@link Address}
 * @category Elements
 */
export type AddressElement = ReturnType<typeof Address>;
