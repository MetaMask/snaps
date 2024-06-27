import type { FunctionComponent, ReactNode } from 'react';
export declare type TestProps = {
    children: ReactNode;
    isTest?: boolean;
};
/**
 * Renders the children only if the build is a test build.
 *
 * @param props - The props.
 * @param props.children - The children to render.
 * @param props.isTest - Whether to render only in test builds, or only in non-test
 * builds.
 * @returns The component.
 */
export declare const TestConditional: FunctionComponent<TestProps>;
