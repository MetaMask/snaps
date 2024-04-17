import { createSnapComponent } from '@metamask/snaps-sdk/jsx';

const TYPE = 'divider';

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
