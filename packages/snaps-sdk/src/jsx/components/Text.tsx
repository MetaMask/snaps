import type { Nested } from '../component';
import { createSnapComponent } from '../component';
import type { FormattingElement } from './formatting';

export type TextChildren = Nested<string | FormattingElement>;

/**
 * The props of the {@link Text} component.
 *
 * @property children - The text to display. This should be a string, an array
 * of strings, or an array of formatting elements.
 */
export type TextProps = {
  children?: TextChildren;
};

const TYPE = 'text';

/**
 * A text component, which is used to display text.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display. This should be a string, an
 * array of strings, or an array of formatting elements.
 * @returns A text element.
 * @example
 * <Text>
 *   Hello <Bold>world</Bold>!
 * </Text>
 */
export const Text = createSnapComponent<TextProps, typeof TYPE>(TYPE);

/**
 * A text element.
 *
 * @see Text
 */
export type TextElement = ReturnType<typeof Text>;
