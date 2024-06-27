import type { JsonRpcRequest } from '@metamask/utils';
import type { FunctionComponent } from 'react';
import type { HistoryEntry } from '../slice';
export declare type HistoryItemProps<Request extends {
    request?: JsonRpcRequest;
}> = {
    item: HistoryEntry<Request>;
};
export declare const HistoryItem: FunctionComponent<HistoryItemProps<{
    request?: JsonRpcRequest;
}>>;
