import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
export declare type AlertDialogProps = {
    snapName: string;
    snapId: string;
    content: JSXElement;
    onClose?: () => void;
};
/**
 * Snap alert dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.content - The component to render.
 * @param props.onClose - The close callback.
 * @returns The component.
 */
export declare const AlertDialog: FunctionComponent<AlertDialogProps>;
