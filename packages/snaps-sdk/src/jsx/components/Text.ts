import type { MaybeArray } from '../component';
import { createSnapComponent } from '../component';
import type { StandardFormattingElement } from './formatting';
import type { LinkElement } from './Link';

export type TextChildren = MaybeArray<
  string | StandardFormattingElement | LinkElement
>;

/**
 * The props of the {@link Text} component.
 *
 * @property children - The text to display.
 */
export type TextProps = {
  children: TextChildren;
};

const TYPE = 'Text';

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
export const Text = createSnapComponent<TextProps, typeof TYPE>(TYPE);

/**
 * A text element.
 *
 * @see Text
 */
export type TextElement = ReturnType<typeof Text>;
