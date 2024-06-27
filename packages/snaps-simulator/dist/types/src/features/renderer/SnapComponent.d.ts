import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
export declare const components: Partial<Record<string, FunctionComponent<{
    id: string;
    node: unknown;
    form?: string;
}>>>;
declare type SnapComponentProps = {
    node: JSXElement | null;
    form?: string;
    map?: Record<string, number>;
    id?: string;
};
export declare const SnapComponent: FunctionComponent<SnapComponentProps>;
export {};
