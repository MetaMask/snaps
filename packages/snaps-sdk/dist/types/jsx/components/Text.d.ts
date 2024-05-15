import type { MaybeArray } from '../component';
import type { StandardFormattingElement } from './formatting';
import type { LinkElement } from './Link';
/**
 * The children of the {@link Text} component.
 */
export declare type TextChildren = MaybeArray<string | StandardFormattingElement | LinkElement | null>;
/**
 * The props of the {@link Text} component.
 *
 * @property children - The text to display.
 */
export declare type TextProps = {
    children: TextChildren;
};
/**
 * A text component, which is used to display text.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display.
 * @returns A text element.
 * @example
 * <Text>
 *   Hello <Bold>world</Bold>!
 * </Text>
 */
export declare const Text: import("../component").SnapComponent<TextProps, "Text">;
/**
 * A text element.
 *
 * @see Text
 */
export declare type TextElement = ReturnType<typeof Text>;
