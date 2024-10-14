import type { CaipAccountId } from '@metamask/utils';

import { createSnapComponent } from '../component';

/**
 * The props of the {@link Address} component.
 *
 * @property address - The (Ethereum) address to display. This should be a
 * valid Ethereum address, starting with `0x`, or a valid CAIP-10 address.
 * @property truncate - Optional boolean flag used to control truncation of the address.
 * @property displayName - Optional boolean flag used to control displaying a name of an account or contact.
 * @property avatar - Optional boolean flag used to control displaying of the address avatar.
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
 * @param props.truncate - Optional boolean flag used to control truncation of the address.
 * @param props.displayName - Optional boolean flag used to control displaying a name of an account or contact.
 * @param props.avatar - Optional boolean flag used to control displaying of the address avatar.
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
 */
export const Address = createSnapComponent<AddressProps, typeof TYPE>(TYPE);

/**
 * An address element.
 *
 * @see Address
 */
export type AddressElement = ReturnType<typeof Address>;
