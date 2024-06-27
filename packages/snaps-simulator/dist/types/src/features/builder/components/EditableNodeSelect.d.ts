import type { FunctionComponent } from 'react';
declare type EditableNodeSelectProps = {
    defaultValue: string | undefined;
    options: string[];
    onChange: (value: string) => void;
};
/**
 * A dropdown for an editable node enum field, which renders a dropdown field in the editable component.
 *
 * @param props - The props of the component.
 * @param props.defaultValue - The property default value.
 * @param props.options - The options of the dropdown.
 * @param props.onChange - A function to call when the dropdown changes.
 * @returns An editable node dropdown component.
 */
export declare const EditableNodeSelect: FunctionComponent<EditableNodeSelectProps>;
export {};
