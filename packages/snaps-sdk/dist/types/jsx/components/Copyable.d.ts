/**
 * The props of the {@link Copyable} component.
 *
 * @property value - The value to copy when the user clicks on the copyable
 * element.
 * @property sensitive - Whether the value is sensitive. If `true`, the value
 * will be hidden when the user is not interacting with the copyable element.
 */
export declare type CopyableProps = {
    value: string;
    sensitive?: boolean | undefined;
};
/**
 * A copyable component, which is used to display text that can be copied by the
 * user.
 *
 * @param props - The props of the component.
 * @param props.value - The value to copy when the user clicks on the copyable
 * element.
 * @param props.sensitive - Whether the value is sensitive. If `true`, the value
 * will be hidden when the user is not interacting with the copyable element.
 * @example
 * <Copyable value="0x1234567890123456789012345678901234567890" />
 * <Copyable value="0x1234567890123456789012345678901234567890" sensitive />
 */
export declare const Copyable: import("../component").SnapComponent<CopyableProps, "Copyable">;
/**
 * A copyable element.
 *
 * @see Copyable
 */
export declare type CopyableElement = ReturnType<typeof Copyable>;
