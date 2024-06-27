import type { FunctionComponent } from 'react';
declare type ItemProps = {
    isValid: boolean;
    name: string;
    manifestName: string;
    message?: string | undefined;
};
/**
 * A manifest validation item.
 *
 * @param props - The Item component props.
 * @param props.isValid - Whether the item is valid.
 * @param props.name - The name of the item.
 * @param props.manifestName - The name of the item in the manifest.
 * @param props.message - The validation message.
 * @returns The Item component.
 */
export declare const Item: FunctionComponent<ItemProps>;
export {};
