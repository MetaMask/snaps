import type { GenericSnapElement, SnapsChildren } from '../component';
/**
 * The props of the {@link Box} component.
 *
 * @property children - The children of the box.
 * @property direction - The direction to stack the components within the box. Defaults to `vertical`.
 * @property alignment - The alignment mode to use within the box. Defaults to `start`.
 */
export declare type BoxProps = {
    children: SnapsChildren<GenericSnapElement>;
    direction?: 'vertical' | 'horizontal' | undefined;
    alignment?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | undefined;
};
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
export declare const Box: import("../component").SnapComponent<BoxProps, "Box">;
/**
 * A box element.
 *
 * @see Box
 */
export declare type BoxElement = ReturnType<typeof Box>;
