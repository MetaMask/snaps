import { createSnapComponent } from '../component';
import type { StandardFormattingElement } from './formatting';
import type { ImageElement } from './Image';
import type { LinkElement } from './Link';
import type { TextElement } from './Text';

export type TooltipChildren =
  | TextElement
  | StandardFormattingElement
  | LinkElement
  | ImageElement
  | null;

/**
 * The props of the {@link Tooltip} component.
 *
 * @property children - The children of the box.
 * @property content - The text to display in the tooltip.
 */
export type TooltipProps = {
  children: TooltipChildren;
  content: TextElement | StandardFormattingElement | LinkElement | string;
};

const TYPE = 'Tooltip';

/**
 * A tooltip component, which is used to display text in a tooltip.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the tooltip.
 * @param props.content - The text to display in the tooltip.
 * @returns A tooltip element.
 * @example
 * <Tooltip content={<Text>foo</Text>}>
 *   <Text>Hello world!</Text>
 * </Tooltip>
 */
export const Tooltip = createSnapComponent<TooltipProps, typeof TYPE>(TYPE);

/**
 * A box element.
 *
 * @see Tooltip
 */
export type TooltipElement = ReturnType<typeof Tooltip>;
