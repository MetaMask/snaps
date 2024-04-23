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
 */
export const Divider = createSnapComponent(TYPE);

/**
 * A divider element.
 *
 * @see Divider
 */
export type DividerElement = ReturnType<typeof Divider>;
