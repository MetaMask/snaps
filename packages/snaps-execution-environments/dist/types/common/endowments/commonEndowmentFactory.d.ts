import type { SnapId } from '@metamask/snaps-utils';
export declare type EndowmentFactoryOptions = {
    snapId?: SnapId;
};
export declare type EndowmentFactory = {
    names: readonly string[];
    factory: (options?: EndowmentFactoryOptions) => {
        [key: string]: unknown;
    };
};
export declare type CommonEndowmentSpecification = {
    endowment: unknown;
    name: string;
    bind?: boolean;
};
/**
 * Creates a consolidated collection of common endowments.
 * This function will return factories for all common endowments including
 * the additionally attenuated. All hardened with SES.
 *
 * @returns An object with common endowments.
 */
declare const buildCommonEndowments: () => EndowmentFactory[];
export default buildCommonEndowments;
