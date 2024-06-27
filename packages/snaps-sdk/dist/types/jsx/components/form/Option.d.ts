/**
 * The props of the {@link Option} component.
 *
 * @property value - The value of the dropdown option. This is used to populate the
 * state in the form data.
 * @property children - The text to display.
 */
declare type OptionProps = {
    value: string;
    children: string;
};
/**
 * A dropdown option component, which is used to create a dropdown option. This component
 * can only be used as a child of the {@link Dropdown} component.
 *
 * @param props - The props of the component.
 * @param props.value - The value of the dropdown option. This is used to populate the
 * state in the form data.
 * @param props.children - The text to display.
 * @returns A dropdown option element.
 * @example
 * <Dropdown name="dropdown">
 *  <Option value="option1">Option 1</Option>
 *  <Option value="option2">Option 2</Option>
 *  <Option value="option3">Option 3</Option>
 * </Dropdown>
 */
export declare const Option: import("../../component").SnapComponent<OptionProps, "Option">;
/**
 * A dropdown option element.
 *
 * @see Option
 */
export declare type OptionElement = ReturnType<typeof Option>;
export {};
