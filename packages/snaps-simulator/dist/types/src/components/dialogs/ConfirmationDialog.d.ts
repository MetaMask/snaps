import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
export declare type ConfirmationDialogProps = {
    snapName: string;
    snapId: string;
    content: JSXElement;
    onCancel?: () => void;
    onApprove?: () => void;
};
/**
 * Snap confirmation dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.content - The component to render.
 * @param props.onCancel - The cancel callback.
 * @param props.onApprove - The approve callback.
 * @returns The component.
 */
export declare const ConfirmationDialog: FunctionComponent<ConfirmationDialogProps>;
