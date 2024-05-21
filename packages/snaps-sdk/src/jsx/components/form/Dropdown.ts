import type { MaybeArray } from '../../component';
import { createSnapComponent } from '../../component';
import type { DropdownOptionElement } from './DropdownOption';

// TODO: Add the `onChange` prop to the `InputProps` type.

/**
 * The props of the {@link Dropdown} component.
 *
 * @property name - The name of the dropdown. This is used to identify the
 * state in the form data.
 */
type DropdownProps = {
  name: string;
  children: MaybeArray<DropdownOptionElement>;
};

const TYPE = 'Dropdown';

/**
 * A dropdown component, which is used to create a dropdown. This component
 * can only be used as a child of the {@link Field} component.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the dropdown field. This is used to identify the
 * state in the form data.
 * @returns A dropdown element.
 * @example
 * <Dropdown name="dropdown">
 *  <DropdownOption value="option1">Option 1</DropdownOption>
 *  <DropdownOption value="option2">Option 2</DropdownOption>
 *  <DropdownOption value="option3">Option 3</DropdownOption>
 * </Dropdown>
 */
export const Dropdown = createSnapComponent<DropdownProps, typeof TYPE>(TYPE);

/**
 * A dropdown element.
 *
 * @see Dropdown
 */
export type DropdownElement = ReturnType<typeof Dropdown>;
