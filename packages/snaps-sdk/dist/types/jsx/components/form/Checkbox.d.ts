/**
 * The props of the {@link Checkbox} component.
 *
 * @property name - The name of the checkbox. This is used to identify the
 * state in the form data.
 * @property checked - Whether the checkbox is checked or not.
 * @property label - An optional label for the checkbox.
 * @property variant - An optional variant for the checkbox.
 */
export declare type CheckboxProps = {
    name: string;
    checked?: boolean | undefined;
    label?: string | undefined;
    variant?: 'default' | 'toggle' | undefined;
};
/**
 * A checkbox component, which is used to create a checkbox.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the checkbox. This is used to identify the
 * state in the form data.
 * @param props.checked - Whether the checkbox is checked or not.
 * @param props.label - An optional label for the checkbox.
 * @param props.variant - An optional variant for the checkbox.
 * @returns A checkbox element.
 * @example
 * <Checkbox name="accept-terms" />
 */
export declare const Checkbox: import("../../component").SnapComponent<CheckboxProps, "Checkbox">;
/**
 * A checkbox element.
 *
 * @see Checkbox
 */
export declare type CheckboxElement = ReturnType<typeof Checkbox>;
