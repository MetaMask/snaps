import { createSnapComponent } from '../component';

const TYPE = 'Spinner';

/**
 * A spinner component, which is used to display a spinner, indicating that some
 * operation is in progress.
 *
 * This component does not accept any props.
 *
 * @returns A spinner element.
 * @example
 * <Spinner />
 */
export const Spinner = createSnapComponent(TYPE);

/**
 * A spinner element.
 *
 * @see Spinner
 */
export type SpinnerElement = ReturnType<typeof Spinner>;
