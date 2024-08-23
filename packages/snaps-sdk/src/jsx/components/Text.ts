import type { SnapsChildren } from '../component';
import { createSnapComponent } from '../component';
import type { StandardFormattingElement } from './formatting';
import type { IconElement } from './Icon';
import type { LinkElement } from './Link';

/**
 * The children of the {@link Text} component.
 */
export type TextChildren = SnapsChildren<
  string | StandardFormattingElement | LinkElement | IconElement
>;

/**
 * The colors available to the Text {@link Text} component.
 */
export type TextColors =
  | 'default'
  | 'alternative'
  | 'muted'
  | 'error'
  | 'success'
  | 'warning';

/**
 * The props of the {@link Text} component.
 *
 * @property children - The text to display.
 */
export type TextProps = {
  children: TextChildren;
  alignment?: 'start' | 'center' | 'end' | undefined;
  color?: TextColors | undefined;
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
 * @example
 * <Text alignment="end">
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
