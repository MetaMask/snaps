import type { JsonObject, MaybeArray, SnapElement } from '../../component';
/**
 * The children of the {@link Bold} component.
 */
export declare type BoldChildren = MaybeArray<string | SnapElement<JsonObject, 'Italic'> | null>;
/**
 * The props of the {@link Bold} component.
 *
 * @property children - The text to display in bold.
 */
export declare type BoldProps = {
    children: BoldChildren;
};
/**
 * A bold component, which is used to display text in bold. This component can
 * only be used as a child of the {@link Text} component.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in bold.
 * @returns A bold element.
 * @example
 * <Text>
 *   Hello <Bold>world</Bold>!
 * </Text>
 */
export declare const Bold: import("../../component").SnapComponent<BoldProps, "Bold">;
/**
 * A bold element.
 *
 * @see Bold
 */
export declare type BoldElement = ReturnType<typeof Bold>;
