import type { ButtonElement, FieldElement, FormElement, InputElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
import type { EditableNodeProps } from '../../../types';
export declare type MultiEditableComponent = ButtonElement | InputElement | FormElement | FieldElement;
declare enum FieldType {
    String = "string",
    Dropdown = "dropdown"
}
declare type MultiEditableNodes = Record<MultiEditableComponent['type'], Record<string, {
    type: FieldType.String;
} | {
    type: FieldType.Dropdown;
    values: string[];
}>>;
export declare const MULTI_EDITABLE_NODES: MultiEditableNodes;
/**
 * An editable node with multiple fields, which renders an editable component in the builder.
 *
 * @param props - The props of the component.
 * @param props.node - The editable node to render.
 * @param props.depth - The depth of the node in the tree.
 * @param props.isDragging - Whether the node is being dragged.
 * @param props.onChange - A function to call when the node changes.
 * @param props.onClose - A function to call when the node is closed.
 * @returns An editable node component.
 */
export declare const MultiEditableNode: FunctionComponent<EditableNodeProps<MultiEditableComponent>>;
export {};
