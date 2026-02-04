import { createSnapComponent } from '../component';

const TYPE = 'Divider';

/**
 * A divider component, which is used to create a horizontal line between
 * elements.
 *
 * This component does not have any props.
 *
 * @returns A divider element.
 * @example
 * <Divider />
 * @category Components
 */
export const Divider = createSnapComponent(TYPE);

/**
 * A divider element.
 *
 * @see {@link Divider}
 * @category Elements
 */
export type DividerElement = ReturnType<typeof Divider>;
