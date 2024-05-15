import type { JsonObject, MaybeArray, SnapElement } from '../../component';
/**
 * The children of the {@link Italic} component.
 */
export declare type ItalicChildren = MaybeArray<string | SnapElement<JsonObject, 'Bold'> | null>;
/**
 * The props of the {@link Italic} component.
 *
 * @property children - The text to display in italic. This should be a string
 * or an array of strings.
 */
export declare type ItalicProps = {
    children: ItalicChildren;
};
/**
 * An italic component, which is used to display text in italic. This componen
 * can only be used as a child of the {@link Text} component.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in italic. This should be a
 * string or an array of strings.
 * @returns An italic element.
 * @example
 * <Text>
 *   Hello <Italic>world</Italic>!
 * </Text>
 */
export declare const Italic: import("../../component").SnapComponent<ItalicProps, "Italic">;
/**
 * An italic element.
 *
 * @see Italic
 */
export declare type ItalicElement = ReturnType<typeof Italic>;
