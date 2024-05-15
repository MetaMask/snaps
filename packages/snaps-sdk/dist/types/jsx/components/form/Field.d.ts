import type { InputElement } from './Input';
/**
 * The props of the {@link Field} component.
 *
 * @property label - The label of the field.
 * @property error - The error message of the field.
 * @property children - The input field and the submit button.
 */
export declare type FieldProps = {
    label?: string | undefined;
    error?: string | undefined;
    children: InputElement;
};
/**
 * A field component, which is used to create a form field. This component can
 * only be used as a child of the {@link Form} component.
 *
 * @param props - The props of the component.
 * @param props.label - The label of the field.
 * @param props.error - The error message of the field.
 * @param props.children - The input field and the submit button.
 * @returns A field element.
 * @example
 * <Field label="Username">
 *   <Input name="username" type="text" />
 * </Field>
 */
export declare const Field: import("../../component").SnapComponent<FieldProps, "Field">;
/**
 * A field element.
 *
 * @see Field
 */
export declare type FieldElement = ReturnType<typeof Field>;
