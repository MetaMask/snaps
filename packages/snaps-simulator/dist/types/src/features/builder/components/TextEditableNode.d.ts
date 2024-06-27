import type { CopyableElement, HeadingElement, TextElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
import type { EditableNodeProps } from '../../../types';
export declare type TextEditableComponent = TextElement | HeadingElement | CopyableElement;
export declare const TEXT_EDITABLE_NODES: string[];
/**
 * An editable node with a text field, which renders an editable component in the builder.
 *
 * @param props - The props of the component.
 * @param props.node - The editable node to render.
 * @param props.depth - The depth of the node in the tree.
 * @param props.isDragging - Whether the node is being dragged.
 * @param props.onChange - A function to call when the node changes.
 * @param props.onClose - A function to call when the node is closed.
 * @returns An editable node component.
 */
export declare const TextEditableNode: FunctionComponent<EditableNodeProps<TextEditableComponent>>;
