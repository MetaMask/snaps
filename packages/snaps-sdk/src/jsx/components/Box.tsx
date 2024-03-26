import type { SnapNode } from '../component';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Box} component.
 *
 * @property children - The children of the box.
 */
export type BoxProps = {
  children: SnapNode;
  alignment?: 'start' | 'center' | 'end' | undefined;
};

const TYPE = 'box';

/**
 * A box component, which is used to group multiple components together.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the box.
 * @param props.alignment - The alignment of the box. This can be `start`,
 * `center`, or `end`. The default is `start`.
 * @returns A box element.
 * @example
 * <Box alignment="center">
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
