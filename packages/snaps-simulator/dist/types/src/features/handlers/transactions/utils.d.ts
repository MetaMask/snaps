export declare type TransactionFormData = {
    chainId: string;
    transactionOrigin: string;
    from: string;
    to: string;
    nonce: string;
    value: string;
    data: string;
    gas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
};
export declare const hexlifyTransactionData: (transaction: Omit<TransactionFormData, 'transactionOrigin' | 'chainId'>) => {
    to: string;
    from: string;
    data: string;
    gas: string;
    nonce: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    value: string;
};
