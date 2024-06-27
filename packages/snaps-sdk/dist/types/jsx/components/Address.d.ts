/**
 * The props of the {@link Address} component.
 *
 * @property address - The (Ethereum) address to display. This should be a
 * valid Ethereum address, starting with `0x`.
 */
export declare type AddressProps = {
    address: `0x${string}`;
};
/**
 * An address component, which is used to display an Ethereum address.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.address - The (Ethereum) address to display. This should be a
 * valid Ethereum address, starting with `0x`.
 * @returns An address element.
 * @example
 * <Address address="0x1234567890123456789012345678901234567890" />
 */
export declare const Address: import("../component").SnapComponent<AddressProps, "Address">;
/**
 * An address element.
 *
 * @see Address
 */
export declare type AddressElement = ReturnType<typeof Address>;
