import { createSnapComponent } from '../../component';

/**
 * The props of the {@link Dropdown} component.
 *
 * @property value - The value of the dropdown option. This is used to populate the
 * state in the form data.
 */
type DropdownOptionProps = {
  value: string;
  children: string;
};

const TYPE = 'DropdownOption';

/**
 * A dropdown option component, which is used to create a dropdown option. This component
 * can only be used as a child of the {@link Dropdown} component.
 *
 * @param props - The props of the component.
 * @param props.value - The value of the dropdown option. This is used to populate the
 * state in the form data.
 * @returns A dropdown option element.
 * @example
 * <Dropdown name="dropdown">
 *  <DropdownOption value="option1">Option 1</DropdownOption>
 *  <DropdownOption value="option2">Option 2</DropdownOption>
 *  <DropdownOption value="option3">Option 3</DropdownOption>
 * </Dropdown>
 */
export const DropdownOption = createSnapComponent<
  DropdownOptionProps,
  typeof TYPE
>(TYPE);

/**
 * A dropdown element.
 *
 * @see Dropdown
 */
export type DropdownOptionElement = ReturnType<typeof DropdownOption>;
