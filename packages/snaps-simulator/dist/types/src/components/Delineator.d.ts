import type { FunctionComponent, ReactNode } from 'react';
export declare type DelineatorProps = {
    type: DelineatorType;
    snapName: string;
    children: ReactNode;
};
export declare enum DelineatorType {
    Content = "content",
    Error = "error",
    Insights = "insights"
}
export declare const Delineator: FunctionComponent<DelineatorProps>;
