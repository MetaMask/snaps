import type { FunctionComponent } from 'react';
import type { TransactionFormData } from '../utils';
export declare type TransactionPrefillProps = TransactionFormData & {
    name: string;
    onClick: (prefill: TransactionFormData) => void;
};
export declare const TransactionPrefill: FunctionComponent<TransactionPrefillProps>;
