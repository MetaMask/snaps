import type { GenericSnapElement, SnapsChildren } from '../../component';
import { createSnapComponent } from '../../component';

// TODO: Add `onSubmit` prop to the `FormProps` type.

/**
 * The props of the {@link Form} component.
 *
 * @property children - The children of the form.
 * @property name - The name of the form. This is used to identify the form in
 * the event handler.
 */
export type FormProps = {
  children: SnapsChildren<GenericSnapElement>;
  name: string;
};

const TYPE = 'Form';

/**
 * A form component, which is used to create a form.
 *
 * @param props - The props of the component.
 * @param props.children - The form fields. This should be a single field or an
 * array of fields.
 * @param props.name - The name of the form. This is used to identify the form
 * in the event handler.
 * @returns A form element.
 * @example
 * <Form name="my-form">
 *   <Field label="Username">
 *     <Input name="username" type="text" />
 *   </Field>
 *   <Button type="submit">Submit</Button>
 * </Form>
 */
export const Form = createSnapComponent<FormProps, typeof TYPE>(TYPE);

/**
 * A form element.
 *
 * @see Form
 */
export type FormElement = ReturnType<typeof Form>;
