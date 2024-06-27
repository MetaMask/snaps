import { type FunctionComponent } from 'react';
declare type EditableNodeInputProps = {
    placeholder: string;
    defaultValue: string | undefined;
    onChange?: (value: string) => void;
};
/**
 * A text field for an editable node text field, which renders an input field in the editable component.
 *
 * @param props - The props of the component.
 * @param props.placeholder - The placeholder of the input field.
 * @param props.defaultValue - The property default value.
 * @param props.onChange - A function to call when the dropdown changes.
 * @returns An editable node text field component.
 */
export declare const EditableNodeInput: FunctionComponent<EditableNodeInputProps>;
export {};
