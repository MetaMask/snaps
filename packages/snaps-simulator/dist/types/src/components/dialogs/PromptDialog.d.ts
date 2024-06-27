import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
export declare type PromptDialogProps = {
    snapName: string;
    snapId: string;
    placeholder?: string;
    content: JSXElement;
    onCancel?: () => void;
    onSubmit?: (value: string) => void;
};
/**
 * Snap prompt dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.placeholder - The placeholder text.
 * @param props.content - The component to render.
 * @param props.onCancel - The cancel callback.
 * @param props.onSubmit - The submit callback. The value is passed as the first
 * argument.
 * @returns The component.
 */
export declare const PromptDialog: FunctionComponent<PromptDialogProps>;
