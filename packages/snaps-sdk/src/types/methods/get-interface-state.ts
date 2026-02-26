import type { InterfaceState } from '../interface';

/**
 * An object containing the parameters for the `snap_getInterfaceState` method.
 *
 * @property id - The interface ID.
 */
export type GetInterfaceStateParams = {
  id: string;
};

/**
 * The state of the given interface. This is a `Record` of the form state, where
 * the keys are the `name` properties of the form fields, and the values are the
 * current values of those fields, depending on the type of the field.
 *
 * For example, for a text field, the value would be a `string`, for a checkbox
 * field, the value would be a `boolean`, and for a file upload field, the value
 * would be a `File` object. The exact structure of the state depends on the
 * form fields that were defined when the interface was created.
 */
export type GetInterfaceStateResult = InterfaceState;
