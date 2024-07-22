import type { InputElement, SnapsChildren } from '@metamask/snaps-sdk/jsx';

import { createSnapComponent } from '../component';

const TYPE = 'RadioButton';

/**
 * The props of the {@link RadioButton} component.
 *
 * @property name - The name of the dropdown. This is used to identify the
 * state in the form data.
 * @property children - Radio button options in form of Input (type: radio) elements.
 */
type RadioButtonProps = {
  name: string;
  children: SnapsChildren<InputElement>;
};

/**
 * A Radio Button component, used to display multiple choices, where only one can be chosen.
 *
 * @returns A Radio Button element.
 * @example
 * <RadioButton />
 */
export const RadioButton = createSnapComponent<RadioButtonProps, typeof TYPE>(
  TYPE,
);

/**
 * A Radio Button element.
 *
 * @see RadioButton
 */
export type RadioButtonElement = ReturnType<typeof RadioButton>;
