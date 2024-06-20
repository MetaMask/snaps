import { createSnapComponent } from '../../component';

/**
 * The props of the {@link Checkbox} component.
 *
 * @property name - The name of the checkbox. This is used to identify the
 * state in the form data.
 * @property value - Whether the checkbox is checked or not.
 */
export type CheckboxProps = {
  name: string;
  value?: boolean | undefined;
};

const TYPE = 'Checkbox';

/**
 * A checkbox component, which is used to create a checkbox.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the checkbox. This is used to identify the
 * state in the form data.
 * @param props.value - Whether the checkbox is checked or not.
 * @returns A checkbox element.
 * @example
 * <Checkbox name="accept-terms" />
 */
export const Checkbox = createSnapComponent<CheckboxProps, typeof TYPE>(TYPE);

/**
 * A checkbox element.
 *
 * @see Checkbox
 */
export type CheckboxElement = ReturnType<typeof Checkbox>;
