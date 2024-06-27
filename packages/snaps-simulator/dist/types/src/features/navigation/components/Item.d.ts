import type { FunctionComponent, ReactNode } from 'react';
declare type ItemProps = {
    path: string;
    tag: string;
    isExternal?: boolean;
    onClick?: () => void;
    children: ReactNode;
};
export declare const Item: FunctionComponent<ItemProps>;
export {};
