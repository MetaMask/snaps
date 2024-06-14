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
 */
export type TooltipProps = {
  children: TooltipChildren;
  value: TextElement | StandardFormattingElement | LinkElement | string;
};

const TYPE = 'Tooltip';

/**
 * A tooltip component, which is used to display text in a tooltip.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the tooltip.
 * @returns A tooltip element.
 * @example
 * <Tooltip value={<Text>foo</Text>}>
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
