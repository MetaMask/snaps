import type { StringElement } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Heading} component.
 *
 * @property children - The text to display in the heading.
 */
type HeadingProps = {
  children: StringElement;
};

const TYPE = 'Heading';

/**
 * A heading component, which is used to display heading text.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in the heading.
 * @returns A heading element.
 * @example
 * <Heading>Hello world!</Heading>
 */
export const Heading = createSnapComponent<HeadingProps, typeof TYPE>(TYPE);

/**
 * A heading element.
 *
 * @see Heading
 */
export type HeadingElement = ReturnType<typeof Heading>;
