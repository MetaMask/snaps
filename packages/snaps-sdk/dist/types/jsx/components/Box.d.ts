import type { GenericSnapElement, MaybeArray } from '../component';
/**
 * The props of the {@link Box} component.
 *
 * @property children - The children of the box.
 */
export declare type BoxProps = {
    children: MaybeArray<GenericSnapElement | null>;
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
