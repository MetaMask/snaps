import type { FunctionComponent } from 'react';
import type { TransactionFormData } from '../utils';
export declare type TransactionPrefillsProps = {
    onClick: (prefill: TransactionFormData) => void;
};
export declare const TransactionPrefills: FunctionComponent<TransactionPrefillsProps>;
