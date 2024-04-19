import type { GenericSnapElement, Nested } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Box} component.
 *
 * @property children - The children of the box.
 */
export type BoxProps = {
  // We can't use `JSXElement` because it causes a circular reference.
  children: Nested<GenericSnapElement>;
};

const TYPE = 'box';

/**
 * A box component, which is used to group multiple components together.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the box.
 * @returns A box element.
 * @example
 * <Box>
 *   <Text>Hello world!</Text>
 * </Box>
 */
export const Box = createSnapComponent<BoxProps, typeof TYPE>(TYPE);

/**
 * A box element.
 *
 * @see Box
 */
export type BoxElement = ReturnType<typeof Box>;
