import type { LocalizationFile, SnapManifest, VirtualFile } from '@metamask/snaps-utils';
declare type ValidatorContext = {
    sourceCode: VirtualFile<string>;
    icon: VirtualFile<string>;
    auxiliaryFiles: VirtualFile[];
    localizationFiles: VirtualFile<LocalizationFile>[];
};
declare type ValidatorFunction = (value: VirtualFile<SnapManifest>, context: ValidatorContext) => Promise<boolean | string>;
export declare type Validator = {
    name: string;
    manifestName: string;
    validator: ValidatorFunction;
};
export declare const validators: Validator[];
export {};
