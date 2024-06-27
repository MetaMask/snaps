import type { Json } from '@metamask/utils';
import type { FunctionComponent } from 'react';
export declare type CronjobData = {
    method: string;
    params?: Json | undefined;
};
export declare type CronjobPrefillProps = CronjobData & {
    onClick: (prefill: CronjobData) => void;
};
export declare const CronjobPrefill: FunctionComponent<CronjobPrefillProps>;
