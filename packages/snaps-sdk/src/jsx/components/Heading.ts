import type { StringElement } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Heading} component.
 *
 * @property children - The text to display in the heading.
 * @property size - The size of the heading. Defaults to `sm`.
 * @category Component Props
 */
type HeadingProps = {
  children: StringElement;
  size?: 'sm' | 'md' | 'lg' | undefined;
};

const TYPE = 'Heading';

/**
 * A heading component, which is used to display heading text.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in the heading.
 * @param props.size - The size of the heading. Defaults to `sm`.
 * @returns A heading element.
 * @example
 * <Heading>Hello world!</Heading>
 * @example
 * <Heading size="lg">Hello world!</Heading>
 * @category Components
 */
export const Heading = createSnapComponent<HeadingProps, typeof TYPE>(TYPE);

/**
 * A heading element.
 *
 * @see {@link Heading}
 * @category Elements
 */
export type HeadingElement = ReturnType<typeof Heading>;
