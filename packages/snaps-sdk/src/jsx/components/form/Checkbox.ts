import { createSnapComponent } from '../../component';

/**
 * The props of the {@link Checkbox} component.
 *
 * @property name - The name of the input field. This is used to identify the
 * input field in the form data.
 * @property type - The type of the input field. Defaults to `text`.
 * @property value - The value of the input field.
 * @property placeholder - The placeholder text of the input field.
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
 * @param props.name - The name of the checkboxd. This is used to identify the
 * state in the form data.
 * @param props.value - The value of the input field.
 * @returns An input element.
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
